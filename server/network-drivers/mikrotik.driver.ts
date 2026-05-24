import { RouterOsApiClient } from './routeros-api-client'
import type {
  DriverCheckResult,
  DriverEquipment,
  DriverLease,
  DriverActiveUsersSnapshot,
  DriverNetflowConfig,
  DriverNetwork,
  NetworkManagementDriver,
  UpsertLeasePayload
} from './types'
import { unsupportedCheck } from './types'
import {
  buildNetflowInterfacePlan,
  extractBridgePortInterfaces,
  extractVlanParentInterfaces,
  parseInterfaceSpeedBps,
  parseNetflowCollector,
  resolveInterfaceSpeedBps
} from './netflow'
import { routerOsIdToIfIndex } from '../netflow/interface-roles'

function normalizeBool(value: unknown) {
  return String(value).toLowerCase() === 'true'
}

function normalizeMac(value: unknown) {
  return typeof value === 'string' ? value.toUpperCase() : undefined
}

function asRows(value: unknown) {
  return Array.isArray(value) ? value.filter(row => row && typeof row === 'object') as Record<string, unknown>[] : []
}

function rowMac(row: Record<string, unknown>) {
  return normalizeMac(row['mac-address'] || row.macAddress || row.mac)
}

export class MikrotikDriver implements NetworkManagementDriver {
  code = 'mikrotik_v7'

  constructor(private equipment: DriverEquipment) {}

  private get host() {
    return this.equipment.managementIp || this.equipment.hostname || ''
  }

  private get port() {
    return this.equipment.accessProfile?.defaultPort || this.equipment.managementPort || 8728
  }

  private get username() {
    return this.equipment.accessProfile?.username || ''
  }

  private get password() {
    return this.equipment.accessProfile?.passwordEncrypted || ''
  }

  private async withApi<T>(callback: (api: RouterOsApiClient) => Promise<T> | T): Promise<T> {
    const connection = new RouterOsApiClient({
      host: this.host,
      username: this.username,
      password: this.password,
      port: this.port,
      timeoutMs: 12000
    })

    await connection.connect()
    try {
      return await callback(connection)
    } finally {
      connection.close()
    }
  }

  private async safeCheck(name: string, callback: () => Promise<unknown>): Promise<DriverCheckResult> {
    try {
      const data = await callback()
      return { name, status: 'ok', data }
    } catch (error) {
      return { name, status: 'error', message: error instanceof Error ? error.message : String(error) }
    }
  }

  async ping(target: string): Promise<DriverCheckResult> {
    return this.safeCheck('ping', () => this.withApi(api => api.write('/ping', [`=address=${target}`, '=count=3'])))
  }

  async arpPing(target: string): Promise<DriverCheckResult> {
    return this.safeCheck('arp-ping', async () => {
      const arpRows = asRows(await this.withApi(api => api.write('/ip/arp/print', [`?address=${target}`])))
      const iface = typeof arpRows[0]?.interface === 'string' ? arpRows[0].interface : undefined
      if (!iface) return [{ status: 'ARP entry not found' }]

      return this.withApi(api => api.write('/ping', [`=address=${target}`, '=count=3', '=arp-ping=yes', `=interface=${iface}`]))
    })
  }

  async getDhcpLease(macAddress: string): Promise<DriverCheckResult> {
    return this.safeCheck('dhcp-lease', async () => {
      const rows = asRows(await this.withApi(api => api.write('/ip/dhcp-server/lease/print', [`?mac-address=${macAddress}`])))
      return rows[0] || null
    })
  }

  async getBridgeHost(macAddress: string): Promise<DriverCheckResult> {
    return this.safeCheck('bridge-host', () => this.withApi(api => api.write('/interface/bridge/host/print', [`?mac-address=${macAddress}`])))
  }

  async getSwitchFdb(macAddress: string): Promise<DriverCheckResult> {
    const hostResult = await this.safeCheck('switch-fdb', () => this.withApi(api => api.write('/interface/ethernet/switch/host/print', [`?mac-address=${macAddress}`])))
    if (hostResult.status !== 'error' || !hostResult.message?.includes('no such command prefix')) return hostResult

    const fdbResult = await this.safeCheck('switch-fdb', () => this.withApi(api => api.write('/interface/ethernet/switch/fdb/print', [`?mac-address=${macAddress}`])))
    if (fdbResult.status === 'error' && fdbResult.message?.includes('no such command prefix')) {
      return {
        name: 'switch-fdb',
        status: 'unsupported',
        message: 'RouterOS na tym urządzeniu nie udostępnia switch/host ani switch/fdb'
      }
    }

    return fdbResult
  }

  async getLeases(): Promise<DriverLease[]> {
    const [rows, servers] = await Promise.all([
      this.withApi(api => api.write('/ip/dhcp-server/lease/print')).then(asRows),
      this.withApi(api => api.write('/ip/dhcp-server/print')).then(asRows)
    ])
    const serverInterfaceByName = new Map(servers
      .map(row => [
        typeof row.name === 'string' ? row.name : '',
        typeof row.interface === 'string' ? row.interface : undefined
      ] as const)
      .filter(([name, iface]) => Boolean(name) && Boolean(iface)))

    return rows.map(row => ({
      id: typeof row['.id'] === 'string' ? row['.id'] : typeof row.id === 'string' ? row.id : undefined,
      address: typeof row.address === 'string' ? row.address : undefined,
      macAddress: normalizeMac(row['mac-address']),
      comment: typeof row.comment === 'string' ? row.comment : undefined,
      rateLimit: typeof row['rate-limit'] === 'string' ? row['rate-limit'] : undefined,
      status: typeof row.status === 'string' ? row.status : undefined,
      disabled: normalizeBool(row.disabled),
      blocked: normalizeBool(row.blocked),
      server: typeof row.server === 'string' ? row.server : undefined,
      serverInterface: typeof row.server === 'string' ? serverInterfaceByName.get(row.server) : undefined,
      interface: typeof row.interface === 'string' ? row.interface : undefined,
      raw: row
    }))
  }

  async getActiveUsers(): Promise<DriverActiveUsersSnapshot> {
    const [leases, arpRows, bridgeRows, switchRows, fdbRows] = await Promise.all([
      this.getLeases(),
      this.withApi(api => api.write('/ip/arp/print')).then(asRows).catch(() => []),
      this.withApi(api => api.write('/interface/bridge/host/print')).then(asRows).catch(() => []),
      this.withApi(api => api.write('/interface/ethernet/switch/host/print')).then(asRows).catch(() => []),
      this.withApi(api => api.write('/interface/ethernet/switch/fdb/print')).then(asRows).catch(() => [])
    ])
    const arpMacs = new Set(arpRows.map(rowMac).filter(Boolean))
    const arpIps = new Set(arpRows.map(row => typeof row.address === 'string' ? row.address : '').filter(Boolean))
    const bridgeMacs = new Set(bridgeRows.map(rowMac).filter(Boolean))
    const switchMacs = new Set([...switchRows, ...fdbRows].map(rowMac).filter(Boolean))
    const candidates = leases.filter(lease =>
      lease.macAddress
      && lease.address
      && !lease.disabled
      && !lease.blocked)

    return {
      totalLeases: leases.length,
      candidateLeases: candidates.length,
      activeUsers: candidates.flatMap((lease) => {
        const evidence: Array<'arp' | 'bridge-host' | 'switch-fdb'> = []
        if (arpMacs.has(lease.macAddress!) || arpIps.has(lease.address!)) evidence.push('arp')
        if (bridgeMacs.has(lease.macAddress!)) evidence.push('bridge-host')
        if (switchMacs.has(lease.macAddress!)) evidence.push('switch-fdb')
        if (!evidence.length) return []
        return [{
          macAddress: lease.macAddress!,
          ipAddress: lease.address!,
          server: lease.server,
          serverInterface: lease.serverInterface || lease.interface,
          evidence
        }]
      }),
      evidenceCounts: {
        arp: arpMacs.size,
        bridgeHost: bridgeMacs.size,
        switchFdb: switchMacs.size
      }
    }
  }

  async getNetworks(): Promise<DriverNetwork[]> {
    const rows = asRows(await this.withApi(api => api.write('/ip/dhcp-server/network/print')))

    return rows
      .filter(row => typeof row.address === 'string' && row.address.includes('/'))
      .map(row => ({
        cidr: row.address as string,
        gateway: typeof row.gateway === 'string' ? row.gateway : null,
        comment: typeof row.comment === 'string' ? row.comment : null,
        raw: row
      }))
  }

  async getOnus() {
    return []
  }

  async getOnuInfo(): Promise<DriverCheckResult> {
    return unsupportedCheck('onu-info')
  }

  async getOnuMacTable() {
    return []
  }

  async getOnuIpHosts() {
    return []
  }

  async upsertDhcpLease(payload: UpsertLeasePayload): Promise<DriverCheckResult> {
    return this.safeCheck('sync-lease', async () => {
      const existing = asRows(await this.withApi(api => api.write('/ip/dhcp-server/lease/print', [`?mac-address=${payload.macAddress}`])))
      const body = [
        `=mac-address=${payload.macAddress}`,
        `=address=${payload.ipAddress}`,
        `=comment=${payload.comment || ''}`
      ]
      if (payload.rateLimit) body.push(`=rate-limit=${payload.rateLimit}`)

      const existingId = typeof existing[0]?.['.id'] === 'string' ? existing[0]['.id'] : null
      if (existingId) {
        await this.withApi(api => api.write('/ip/dhcp-server/lease/set', [`=.id=${existingId}`, ...body]))
        return { action: 'updated', payload }
      }

      await this.withApi(api => api.write('/ip/dhcp-server/lease/add', body))
      return { action: 'created', payload }
    })
  }

  async configureNetflow(config: DriverNetflowConfig): Promise<DriverCheckResult> {
    return this.safeCheck('netflow-config', async () => {
      const collector = parseNetflowCollector(config.collector)
      const targetVersion = config.version || collector.version
      const dhcpServers = asRows(await this.withApi(api => api.write('/ip/dhcp-server/print')))
      const routes = asRows(await this.withApi(api => api.write('/ip/route/print', ['?dst-address=0.0.0.0/0'])))
      const bridgePorts = asRows(await this.withApi(api => api.write('/interface/bridge/port/print', ['=.proplist=.id,interface,bridge,disabled'])))
      const routerInterfaces = asRows(await this.withApi(api => api.write('/interface/print', ['=.proplist=.id,name'])))
      const ethernetInterfaces = asRows(await this.withApi(api => api.write('/interface/ethernet/print', ['=.proplist=name,speed,actual-speed'])))
      const vlanInterfaces = asRows(await this.withApi(api => api.write('/interface/vlan/print', ['=.proplist=.id,name,interface,disabled'])))
      const plan = buildNetflowInterfacePlan({ dhcpServers, routes, bridgePorts })
      const ethernetNames = ethernetInterfaces
        .map(row => typeof row.name === 'string' ? row.name : '')
        .filter(Boolean)
      const monitoredEthernetInterfaces = ethernetNames.length
        ? asRows(await this.withApi(api => api.write('/interface/ethernet/monitor', [
            `=numbers=${ethernetNames.join(',')}`,
            '=once='
          ])))
        : []
      const interfaceRowsByName = new Map(routerInterfaces
        .map(row => [typeof row.name === 'string' ? row.name : '', row] as const)
        .filter(([name]) => Boolean(name)))
      const interfaceNamesById = new Map(routerInterfaces
        .map(row => [typeof row['.id'] === 'string' ? row['.id'] : '', typeof row.name === 'string' ? row.name : ''] as const)
        .filter(([id, name]) => Boolean(id) && Boolean(name)))
      const speedEntries = ethernetInterfaces
        .map(row => [
          typeof row.name === 'string' ? row.name : '',
          parseInterfaceSpeedBps(row['actual-speed']) || parseInterfaceSpeedBps(row.speed)
        ] as const)
        .filter((entry): entry is readonly [string, number] => Boolean(entry[0]) && typeof entry[1] === 'number')
      const speedByName = new Map(speedEntries)
      for (const row of monitoredEthernetInterfaces) {
        const name = typeof row.name === 'string' ? row.name : ''
        const speed = parseInterfaceSpeedBps(row.rate)
        if (name && typeof speed === 'number') speedByName.set(name, speed)
      }
      const vlanParentByName = extractVlanParentInterfaces(vlanInterfaces, interfaceNamesById)
      const bridgePortsByName = extractBridgePortInterfaces(bridgePorts)
      const interfaceRoles = plan.roleSources.map((role) => {
        const row = interfaceRowsByName.get(role.name)
        const routerOsId = typeof row?.['.id'] === 'string' ? row['.id'] : undefined
        return {
          ...role,
          routerOsId,
          ifIndex: routerOsIdToIfIndex(routerOsId),
          speedBps: resolveInterfaceSpeedBps(role.name, speedByName, vlanParentByName, bridgePortsByName)
        }
      })

      if (!plan.interfaces.length) {
        return {
          collector: { ...collector, version: targetVersion },
          ...plan,
          interfaceRoles,
          targetAction: 'unchanged',
          warning: 'Nie wykryto interfejsów DHCP ani aktywnego uplinku bramy domyślnej'
        }
      }

      await this.withApi(api => api.write('/ip/traffic-flow/set', [
        '=enabled=yes',
        '=active-flow-timeout=1m',
        '=inactive-flow-timeout=15s',
        `=interfaces=${plan.interfaces.join(',')}`
      ]))

      let ipfixAction: 'configured' | 'skipped' | 'failed' = 'skipped'
      let ipfixError: string | undefined
      if (targetVersion === 'ipfix') {
        try {
          await this.withApi(api => api.write('/ip/traffic-flow/ipfix/set', [
            '=bytes=yes',
            '=packets=yes',
            '=src-address=yes',
            '=dst-address=yes',
            '=src-port=yes',
            '=dst-port=yes',
            '=protocol=yes',
            '=tos=yes',
            '=tcp-flags=yes',
            '=first-forwarded=yes',
            '=last-forwarded=yes',
            '=in-interface=yes',
            '=out-interface=yes',
            '=src-mac-address=yes',
            '=dst-mac-address=yes',
            '=nat-src-address=yes',
            '=nat-dst-address=yes',
            '=nat-src-port=yes',
            '=nat-dst-port=yes'
          ]))
          ipfixAction = 'configured'
        } catch (error) {
          ipfixAction = 'failed'
          ipfixError = error instanceof Error ? error.message : String(error)
        }
      }

      const targets = asRows(await this.withApi(api => api.write('/ip/traffic-flow/target/print')))
      const existingTarget = targets.find(row =>
        row['dst-address'] === collector.address
        && String(row.port) === String(collector.port)
      )
      let targetAction: 'created' | 'updated' = 'created'
      const staleTargets = targets.filter(row =>
        row['dst-address'] !== collector.address
        && String(row.port) === String(collector.port)
        && row.disabled !== 'true'
        && typeof row['.id'] === 'string'
      )

      if (existingTarget && typeof existingTarget['.id'] === 'string') {
        await this.withApi(api => api.write('/ip/traffic-flow/target/set', [
          `=.id=${existingTarget['.id']}`,
          `=dst-address=${collector.address}`,
          `=port=${collector.port}`,
          `=version=${targetVersion}`,
          '=disabled=no'
        ]))
        targetAction = 'updated'
      } else {
        await this.withApi(api => api.write('/ip/traffic-flow/target/add', [
          `=dst-address=${collector.address}`,
          `=port=${collector.port}`,
          `=version=${targetVersion}`,
          '=disabled=no'
        ]))
      }

      for (const target of staleTargets) {
        await this.withApi(api => api.write('/ip/traffic-flow/target/set', [
          `=.id=${target['.id']}`,
          '=disabled=yes'
        ]))
      }

      return {
        collector: { ...collector, version: targetVersion },
        ...plan,
        interfaceRoles,
        ipfixAction,
        ipfixError,
        targetAction,
        staleTargetsDisabled: staleTargets
          .map(target => `${target['dst-address'] || 'unknown'}:${target.port || collector.port}`)
          .filter(Boolean),
        raw: {
          dhcpServers,
          bridgePorts,
          routes,
          routerInterfaces,
          vlanInterfaces,
          ethernetInterfaces,
          monitoredEthernetInterfaces
        }
      }
    })
  }

  async getCommandTree(): Promise<DriverCheckResult> {
    return unsupportedCheck('command-tree')
  }
}

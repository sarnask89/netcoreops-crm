import { Client } from 'ssh2'
import { parseDasanMacTable, parseDasanOnuActive, parseDasanOnuIpHosts, parseDasanRxPower } from './parsers/dasan-parser'
import type {
  DriverCheckResult,
  DriverEquipment,
  DriverMacTableEntry,
  DriverOnu,
  DriverOnuScanOptions,
  DriverOnuIpHost,
  NetworkManagementDriver
} from './types'
import { unsupportedCheck } from './types'

function summarizeCommands(output: string) {
  return [...new Set(output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.includes('show cli') && !line.includes('show list'))
    .filter(line => !line.endsWith('>') && !line.endsWith('#') && !line.startsWith('--'))
    .filter(line => /^[a-z][a-z0-9_-]+(?:\s+[a-z0-9_|./-]+)?/i.test(line))
    .slice(0, 2000))]
}

export class DasanDriver implements NetworkManagementDriver {
  code = 'dasan_nos'

  constructor(private equipment: DriverEquipment) {}

  private get host() {
    const value = this.equipment.managementIp || this.equipment.hostname || ''
    return value.includes(':') ? value.split(':')[0] || '' : value
  }

  private get port() {
    const value = this.equipment.managementIp || ''
    if (value.includes(':')) return Number.parseInt(value.split(':')[1] || '22502', 10)
    return this.equipment.accessProfile?.defaultPort || this.equipment.managementPort || 22502
  }

  private get username() {
    return this.equipment.accessProfile?.username || ''
  }

  private get password() {
    return this.equipment.accessProfile?.passwordEncrypted || ''
  }

  private sanitizeOutput(output: string) {
    const secrets = [
      this.equipment.accessProfile?.passwordEncrypted,
      this.equipment.accessProfile?.apiTokenEncrypted,
      this.equipment.accessProfile?.snmpCommunityEncrypted
    ].filter((value): value is string => Boolean(value))

    return secrets.reduce((sanitized, secret) => sanitized.split(secret).join('[redacted]'), output)
  }

  private runCommands(commands: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const client = new Client()
      const outputs: string[] = []
      let buffer = ''
      let commandIndex = 0
      const promptPattern = /(?:SWITCH|OLT)[^\r\n]*[>#]\s*$/

      const sendNext = (stream: NodeJS.ReadWriteStream) => {
        if (commandIndex >= commands.length) {
          stream.end('exit\n')
          return
        }

        stream.write(`${commands[commandIndex]}\n`)
        commandIndex += 1
      }

      client
        .on('ready', () => {
          client.shell((error, stream) => {
            if (error) {
              reject(error)
              client.end()
              return
            }

            stream
              .on('close', () => {
                if (buffer.trim()) outputs.push(buffer)
                client.end()
                resolve(outputs)
              })
              .on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8')
                if (promptPattern.test(buffer)) {
                  outputs.push(buffer)
                  buffer = ''
                  sendNext(stream)
                }
              })

            sendNext(stream)
          })
        })
        .on('error', reject)
        .connect({
          host: this.host,
          port: this.port,
          username: this.username,
          password: this.password,
          algorithms: {
            kex: [
              'diffie-hellman-group14-sha1',
              'diffie-hellman-group1-sha1',
              'diffie-hellman-group-exchange-sha1'
            ],
            serverHostKey: ['ssh-rsa', 'ssh-dss'],
            cipher: [
              'aes128-cbc',
              '3des-cbc',
              'aes192-cbc',
              'aes256-cbc',
              'aes128-ctr',
              'aes192-ctr',
              'aes256-ctr'
            ],
            hmac: ['hmac-sha1', 'hmac-md5']
          },
          readyTimeout: 15000,
          tryKeyboard: false
        })
    })
  }

  private async safeCheck(name: string, callback: () => Promise<unknown>): Promise<DriverCheckResult> {
    try {
      const data = await callback()
      return { name, status: 'ok', data }
    } catch (error) {
      return { name, status: 'error', message: error instanceof Error ? error.message : String(error) }
    }
  }

  async ping() {
    return unsupportedCheck('ping')
  }

  async arpPing() {
    return unsupportedCheck('arp-ping')
  }

  async getDhcpLease() {
    return unsupportedCheck('dhcp-lease')
  }

  async getBridgeHost(macAddress: string): Promise<DriverCheckResult> {
    return this.safeCheck('bridge-host', async () => {
      const output = await this.runCommands(['terminal length 0', 'enable', `show mac | include ${macAddress}`])
      return parseDasanMacTable(output.join('\n')).filter(row => row.macAddress.toLowerCase() === macAddress.toLowerCase())
    })
  }

  async getSwitchFdb(macAddress: string): Promise<DriverCheckResult> {
    return this.getBridgeHost(macAddress)
  }

  async getLeases() {
    return []
  }

  async getNetworks() {
    return []
  }

  private selectOnusForRxScan(onus: DriverOnu[], options: DriverOnuScanOptions = {}) {
    const numericPart = (value: string) => {
      const parsed = Number.parseInt(value, 10)
      return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
    }
    const sorted = [...onus]
      .filter(onu => !options.activeOnly || onu.status?.toLowerCase() === 'active')
      .sort((left, right) => {
        const portDiff = numericPart(left.oltPort) - numericPart(right.oltPort)
        if (portDiff) return portDiff
        const onuDiff = numericPart(left.onuId) - numericPart(right.onuId)
        if (onuDiff) return onuDiff
        return `${left.oltPort}:${left.onuId}`.localeCompare(`${right.oltPort}:${right.onuId}`)
      })

    if (options.rangeFrom || options.rangeTo) {
      const start = Math.max((options.rangeFrom || 1) - 1, 0)
      const end = Math.max(options.rangeTo || sorted.length, start)
      return sorted.slice(start, end)
    }

    return sorted.slice(0, options.limit)
  }

  async getOnus(options: DriverOnuScanOptions = {}) {
    const output = await this.runCommands(['terminal length 0', 'show onu active'])
    const onus = parseDasanOnuActive(output.join('\n'))
    const selectedOnus = this.selectOnusForRxScan(onus, options)
    if (!selectedOnus.length) return selectedOnus

    try {
      const rxCommands = selectedOnus.map(onu => `show olt rx-power ${onu.oltPort} ${onu.onuId}`)
      const rxOutput = await this.runCommands(['terminal length 0', 'enable', ...rxCommands])
      const rxByOnu = new Map(parseDasanRxPower(rxOutput.join('\n')).map(row => [`${row.oltPort}:${row.onuId}`, row.signalRx]))

      return selectedOnus.map(onu => ({
        ...onu,
        signalRx: rxByOnu.get(`${onu.oltPort}:${onu.onuId}`)
      }))
    } catch {
      return selectedOnus
    }
  }

  async getOnuInfo(oltPort: string, onuId: string): Promise<DriverCheckResult> {
    return this.safeCheck('onu-info', async () => {
      const output = await this.runCommands([
        'terminal length 0',
        'enable',
        `show onu active ${oltPort}`,
        `show olt rx-power ${oltPort} ${onuId}`,
        `show onu ip-host ${oltPort} ${onuId}`
      ])
      const active = parseDasanOnuActive(output.join('\n')).find(row => row.oltPort === oltPort && row.onuId === onuId)
      const power = parseDasanRxPower(output.join('\n')).find(row => row.oltPort === oltPort && row.onuId === onuId)
      const ipHosts = parseDasanOnuIpHosts(output.join('\n'))

      return {
        oltPort,
        onuId,
        status: active?.status || 'Unknown',
        serialNumber: active?.serialNumber || 'Unknown',
        uptime: active?.uptime || 'Unknown',
        signalRx: power?.signalRx || 'Unknown',
        ipHosts
      }
    })
  }

  async getOnuMacTable(oltPort: string, onuId: string): Promise<DriverMacTableEntry[]> {
    const output = await this.runCommands(['terminal length 0', 'enable', `show olt mac ${oltPort} ${onuId}`])
    return parseDasanMacTable(output.join('\n'))
  }

  async getOltMacTable(oltPort: string): Promise<DriverMacTableEntry[]> {
    const output = await this.runCommands(['terminal length 0', 'enable', `show olt mac ${oltPort}`])
    return parseDasanMacTable(output.join('\n'))
  }

  async getOnuIpHosts(oltPort: string, onuId: string): Promise<DriverOnuIpHost[]> {
    const output = await this.runCommands(['terminal length 0', `show onu ip-host ${oltPort} ${onuId}`])
    return parseDasanOnuIpHosts(output.join('\n'))
  }

  async upsertDhcpLease() {
    return unsupportedCheck('sync-lease')
  }

  async getActiveUsers() {
    return {
      totalLeases: 0,
      candidateLeases: 0,
      activeUsers: [],
      evidenceCounts: {
        arp: 0,
        bridgeHost: 0,
        switchFdb: 0
      }
    }
  }

  async configureNetflow() {
    return unsupportedCheck('netflow-config')
  }

  async getCommandTree(): Promise<DriverCheckResult> {
    return this.safeCheck('command-tree', async () => {
      const cliOutput = await this.runCommands(['terminal length 0', 'show cli', 'show list'])
      const enableOutput = await this.runCommands(['terminal length 0', 'enable', 'show cli', 'show list'])
      const cliRaw = this.sanitizeOutput(cliOutput.join('\n'))
      const enableRaw = this.sanitizeOutput(enableOutput.join('\n'))

      return {
        cli: summarizeCommands(cliRaw),
        enable: summarizeCommands(enableRaw),
        rawPreview: {
          cli: cliRaw.slice(0, 12000),
          enable: enableRaw.slice(0, 12000)
        }
      }
    })
  }
}

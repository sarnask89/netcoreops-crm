import type { ImportAction } from '../utils/import-actions'
import type { DriverMacTableEntry, DriverOnu, DriverOnuIpHost } from '../network-drivers/types'
import { analyzeTransparentOnu, type TransparentOnuKnownMac } from './transparent-onu-detector'

export interface KnownFtthOnu {
  id: string
  oltPort: string
  onuId: string
  serialNumber?: string | null
  status?: string | null
}

export function normalizeFtthMac(macAddress?: string | null) {
  return macAddress?.trim().replaceAll('-', ':').replaceAll('.', ':').toLowerCase() || null
}

export function buildFtthOnuPlan(onus: DriverOnu[], knownOnus: KnownFtthOnu[]): ImportAction[] {
  const knownByKey = new Map(knownOnus.map(onu => [`${onu.oltPort}:${onu.onuId}`, onu]))

  return onus.map((onu) => {
    const known = knownByKey.get(`${onu.oltPort}:${onu.onuId}`)

    return {
      action: known ? 'update' : 'create',
      entity: 'ftthOnu',
      key: `${onu.oltPort}/${onu.onuId}`,
      label: `FTTH ONU ${onu.oltPort}/${onu.onuId}`,
      data: {
        onu,
        ftthOnuId: known?.id,
        serialChanged: Boolean(known?.serialNumber && onu.serialNumber && known.serialNumber !== onu.serialNumber)
      }
    }
  })
}

export function buildFtthIpHostPlan(ipHosts: DriverOnuIpHost[], knownOnus: KnownFtthOnu[]): ImportAction[] {
  const knownByKey = new Map(knownOnus.map(onu => [`${onu.oltPort}:${onu.onuId}`, onu]))

  return ipHosts.map((host) => {
    const onu = knownByKey.get(`${host.oltPort}:${host.onuId}`)

    return {
      action: onu ? 'update' : 'skip',
      entity: 'ftthOnuIpHost',
      key: `${host.oltPort}/${host.onuId}/${host.hostId}`,
      label: `IP-host ${host.oltPort}/${host.onuId}/${host.hostId}`,
      reason: onu ? undefined : 'ONU nie istnieje jeszcze w modelu FTTH',
      data: {
        host,
        ftthOnuId: onu?.id
      }
    }
  })
}

export function buildFtthMacMapPlan(
  macRows: DriverMacTableEntry[],
  knownOnus: KnownFtthOnu[],
  knownMacs: TransparentOnuKnownMac[],
  managementMacs: string[] = [],
  managementVlanId = '400',
  oltInventoryId?: string
): ImportAction[] {
  const knownByKey = new Map(knownOnus.map(onu => [`${onu.oltPort}:${onu.onuId}`, onu]))
  const rowsByOnu = new Map<string, DriverMacTableEntry[]>()
  const actions: ImportAction[] = []

  for (const row of macRows) {
    if (!row.oltPort || !row.onuId) {
      actions.push({
        action: 'skip',
        entity: 'ftthOnuMac',
        key: normalizeFtthMac(row.macAddress) || row.macAddress,
        label: row.macAddress,
        reason: 'Wpis MAC nie ma portu OLT i ONU ID',
        data: { row }
      })
      continue
    }

    const key = `${row.oltPort}:${row.onuId}`
    const onu = knownByKey.get(key)
    if (!onu) {
      actions.push({
        action: 'skip',
        entity: 'ftthOnuMac',
        key: normalizeFtthMac(row.macAddress) || row.macAddress,
        label: `${row.macAddress} / ${row.oltPort}/${row.onuId}`,
        reason: 'ONU nie istnieje jeszcze w modelu FTTH',
        data: { row }
      })
      continue
    }

    rowsByOnu.set(key, [...(rowsByOnu.get(key) || []), row])
    actions.push({
      action: 'update',
      entity: 'ftthOnuMac',
      key: normalizeFtthMac(row.macAddress) || row.macAddress,
      label: `${row.macAddress} / VLAN ${row.vlanId || 'brak'} / ONU ${row.oltPort}/${row.onuId}`,
      data: {
        row,
        ftthOnuId: onu.id,
        managementVlan: row.vlanId === managementVlanId
      }
    })
  }

  for (const [key, rows] of rowsByOnu) {
    const onu = knownByKey.get(key)
    if (!onu) continue

    const analysis = analyzeTransparentOnu(rows.map(row => ({
      macAddress: row.macAddress,
      vlanId: row.vlanId || ''
    })), knownMacs, managementMacs)

    if (analysis.transparentCandidate) {
      actions.push({
        action: 'update',
        entity: 'ftthOnu',
        key,
        label: `ONU ${key.replace(':', '/')} jako transparent bridge`,
        data: {
          ftthOnuId: onu.id,
          downstreamMacs: analysis.downstreamMacs
        }
      })

      if (oltInventoryId) {
        actions.push({
          action: 'update',
          entity: 'networkEquipment',
          key: `${oltInventoryId}-ONU-${onu.oltPort}-${onu.onuId}`,
          label: `ONU ${key.replace(':', '/')} w Sieć->Urządzenia`,
          data: {
            ftthOnuId: onu.id,
            inventoryId: `${oltInventoryId}-ONU-${onu.oltPort}-${onu.onuId}`,
            onuPort: onu.oltPort,
            onuId: onu.onuId,
            downstreamMacs: analysis.downstreamMacs
          }
        })
      }
    }

    for (const link of analysis.links) {
      actions.push({
        action: 'link',
        entity: 'ftthTransparentLink',
        key: `${onu.id}:${link.macAddress}`,
        label: `${link.macAddress} za ONU ${key.replace(':', '/')}`,
        data: {
          ftthOnuId: onu.id,
          link
        }
      })
    }
  }

  return actions
}

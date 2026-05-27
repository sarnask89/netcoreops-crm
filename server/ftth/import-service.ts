import { and, eq, isNotNull } from 'drizzle-orm'
import {
  customerDevices,
  ftthOlts,
  ftthOnuIpHosts,
  ftthOnuMacs,
  ftthOnus,
  ftthPonPorts,
  ftthTransparentLinks,
  networkEquipment
} from '../db/schema'
import type { DriverMacTableEntry, DriverOnu, DriverOnuIpHost } from '../network-drivers/types'
import type { ImportAction, ImportMode } from '../utils/import-actions'
import { getOrCreateOnuModelId } from '../utils/import-actions'
import { db } from '../utils/db'
import {
  buildFtthIpHostPlan,
  buildFtthMacMapPlan,
  buildFtthOnuPlan,
  normalizeFtthMac,
  type KnownFtthOnu
} from './import-planner'
import type { TransparentOnuKnownMac } from './transparent-onu-detector'

export async function loadKnownFtthOnus(equipmentId: string, options: { activeOnly?: boolean } = {}): Promise<KnownFtthOnu[]> {
  const olt = await db.query.ftthOlts.findFirst({
    where: eq(ftthOlts.networkEquipmentId, equipmentId),
    with: {
      ponPorts: {
        with: {
          onus: true
        }
      }
    }
  })

  const onus = olt?.ponPorts.flatMap(port => port.onus.map(onu => ({
    id: onu.id,
    oltPort: port.portCode,
    onuId: onu.onuIdentifier,
    serialNumber: onu.serialNumber,
    status: onu.status
  }))) || []

  if (!options.activeOnly) return onus
  return onus.filter(onu => onu.status?.toLowerCase() === 'active')
}

async function ensureFtthOlt(equipmentId: string) {
  const equipment = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, equipmentId) })
  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'OLT nie istnieje' })

  const [created] = await db.insert(ftthOlts).values({
    networkEquipmentId: equipmentId,
    vendor: 'Dasan',
    model: equipment.hostname || equipment.inventoryId,
    managementVlanId: 400,
    description: `Auto-utworzone na podstawie ${equipment.inventoryId}.`
  }).onConflictDoNothing().returning()

  const olt = created || await db.query.ftthOlts.findFirst({ where: eq(ftthOlts.networkEquipmentId, equipmentId) })
  if (!olt) throw createError({ statusCode: 500, statusMessage: 'Nie można utworzyć profilu FTTH OLT' })

  return { olt, equipment }
}

async function ensurePonPort(oltId: string, portCode: string) {
  const [created] = await db.insert(ftthPonPorts).values({
    oltId,
    portCode,
    label: `PON ${portCode}`,
    status: 'ACTIVE'
  }).onConflictDoNothing().returning()

  const port = created || await db.query.ftthPonPorts.findFirst({
    where: and(eq(ftthPonPorts.oltId, oltId), eq(ftthPonPorts.portCode, portCode))
  })
  if (!port) throw createError({ statusCode: 500, statusMessage: `Nie można utworzyć portu PON ${portCode}` })

  return port
}

async function applyOnu(oltEquipmentId: string, onu: DriverOnu) {
  const { olt } = await ensureFtthOlt(oltEquipmentId)
  const ponPort = await ensurePonPort(olt.id, onu.oltPort)
  const existing = await db.query.ftthOnus.findFirst({
    where: and(eq(ftthOnus.ponPortId, ponPort.id), eq(ftthOnus.onuIdentifier, onu.onuId))
  })
  const existingBySerial = onu.serialNumber
    ? await db.query.ftthOnus.findFirst({
        where: eq(ftthOnus.serialNumber, onu.serialNumber)
      })
    : null

  const values = {
    networkEquipmentId: null,
    serialNumber: onu.serialNumber || null,
    status: onu.status || 'UNKNOWN',
    signalRx: onu.signalRx || null,
    lastSeenAt: new Date()
  }

  if (existing) {
    await db.update(ftthOnus).set(values).where(eq(ftthOnus.id, existing.id))
    return existing.id
  }

  if (existingBySerial) {
    await db.update(ftthOnus).set({
      ponPortId: ponPort.id,
      onuIdentifier: onu.onuId,
      ...values
    }).where(eq(ftthOnus.id, existingBySerial.id))
    return existingBySerial.id
  }

  const [created] = await db.insert(ftthOnus).values({
    ponPortId: ponPort.id,
    onuIdentifier: onu.onuId,
    ...values
  }).returning()

  return created?.id
}

export async function syncDasanOnusToFtth(equipmentId: string, onus: DriverOnu[], mode: ImportMode): Promise<ImportAction[]> {
  const knownBefore = await loadKnownFtthOnus(equipmentId)
  const actions = buildFtthOnuPlan(onus, knownBefore)
  if (mode !== 'apply') return actions

  for (const onu of onus) {
    await applyOnu(equipmentId, onu)
  }

  return actions
}

export async function syncDasanOnuIpHostsToFtth(equipmentId: string, ipHosts: DriverOnuIpHost[], mode: ImportMode): Promise<ImportAction[]> {
  const knownOnus = await loadKnownFtthOnus(equipmentId)
  const knownByKey = new Map(knownOnus.map(onu => [`${onu.oltPort}:${onu.onuId}`, onu]))
  const hostsByFtthOnuId = new Map<string, DriverOnuIpHost[]>()
  const actions = buildFtthIpHostPlan(ipHosts, knownOnus)
  if (mode !== 'apply') return actions

  for (const host of ipHosts) {
    const onu = knownByKey.get(`${host.oltPort}:${host.onuId}`)
    if (!onu) continue
    const onuHosts = hostsByFtthOnuId.get(onu.id) || []
    onuHosts.push(host)
    hostsByFtthOnuId.set(onu.id, onuHosts)

    const values = {
      ipOption: host.ipOption || null,
      macAddress: normalizeFtthMac(host.macAddress),
      currentIp: host.currentIp || null,
      currentMask: host.currentMask || null,
      currentGateway: host.currentGateway || null,
      primaryDns: host.primaryDns || null,
      secondaryDns: host.secondaryDns || null,
      hostName: host.hostName || null,
      lastSeenAt: new Date()
    }
    const existing = await db.query.ftthOnuIpHosts.findFirst({
      where: and(eq(ftthOnuIpHosts.onuId, onu.id), eq(ftthOnuIpHosts.hostId, host.hostId))
    })

    if (existing) {
      await db.update(ftthOnuIpHosts).set(values).where(eq(ftthOnuIpHosts.id, existing.id))
    } else {
      await db.insert(ftthOnuIpHosts).values({
        onuId: onu.id,
        hostId: host.hostId,
        ...values
      })
    }
  }

  for (const [onuId, hosts] of hostsByFtthOnuId) {
    const onu = await db.query.ftthOnus.findFirst({ where: eq(ftthOnus.id, onuId) })
    if (!onu?.networkEquipmentId) continue

    const equipment = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, onu.networkEquipmentId) })
    if (!equipment) continue

    const managementIp = await safeManagementIp(hosts, equipment.id)
    if (!managementIp) continue

    await db.update(networkEquipment).set({
      managementIp,
      managementProtocol: equipment.managementProtocol || 'http'
    }).where(eq(networkEquipment.id, equipment.id))
  }

  return actions
}

async function loadKnownMacs(): Promise<TransparentOnuKnownMac[]> {
  const [devices, equipment] = await Promise.all([
    db.query.customerDevices.findMany({ where: isNotNull(customerDevices.macAddress) }),
    db.query.networkEquipment.findMany({ where: isNotNull(networkEquipment.macAddress) })
  ])

  return [
    ...devices.flatMap(device => device.macAddress
      ? [{
          macAddress: device.macAddress,
          type: 'CUSTOMER_DEVICE_BEHIND_ONU' as const,
          targetId: device.id
        }]
      : []),
    ...equipment.flatMap(row => row.macAddress
      ? [{
          macAddress: row.macAddress,
          type: 'BACKBONE_BEHIND_ONU' as const,
          targetId: row.id
        }]
      : [])
  ]
}

async function loadManagementMacs(equipmentId: string) {
  const hostsByOnuId = await loadOnuIpHostsById(equipmentId)
  return [...hostsByOnuId.values()].flatMap(hosts => hosts.flatMap(host => host.macAddress ? [host.macAddress] : []))
}

async function loadOnuIpHostsById(equipmentId: string) {
  const knownOnus = await loadKnownFtthOnus(equipmentId)
  const hostsByOnuId = new Map<string, Array<typeof ftthOnuIpHosts.$inferSelect>>()

  for (const onu of knownOnus) {
    hostsByOnuId.set(onu.id, await db.query.ftthOnuIpHosts.findMany({ where: eq(ftthOnuIpHosts.onuId, onu.id) }))
  }

  return hostsByOnuId
}

function isUsableManagementIp(value?: string | null) {
  return Boolean(value && value !== '0.0.0.0' && value !== '::')
}

function managementHostRank(host: { hostId: string, hostName?: string | null, currentIp?: string | null }) {
  if (!isUsableManagementIp(host.currentIp)) return Number.MAX_SAFE_INTEGER
  const name = (host.hostName || '').toUpperCase()
  if (host.hostId === '1' || /IPHOST|WWW|XML|TR069/.test(name)) return 0
  if (/VEIP|WAN/.test(name)) return 2
  return 1
}

function selectManagementIpHost(hosts: Array<{ hostId: string, hostName?: string | null, currentIp?: string | null }>) {
  return [...hosts]
    .filter(host => isUsableManagementIp(host.currentIp))
    .sort((left, right) => {
      const rankDiff = managementHostRank(left) - managementHostRank(right)
      if (rankDiff) return rankDiff
      return Number.parseInt(left.hostId, 10) - Number.parseInt(right.hostId, 10)
    })[0]?.currentIp || null
}

async function safeManagementIp(hosts: Array<{ hostId: string, hostName?: string | null, currentIp?: string | null }>, equipmentId?: string | null) {
  const managementIp = selectManagementIpHost(hosts)
  if (!managementIp) return null

  const owner = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.managementIp, managementIp) })
  if (owner && owner.id !== equipmentId) return null
  return managementIp
}

async function linkCustomerDeviceToTransparentOnu(ftthOnuId: string, customerDeviceId: string) {
  const onu = await db.query.ftthOnus.findFirst({ where: eq(ftthOnus.id, ftthOnuId) })
  if (!onu) return

  await db.update(customerDevices).set({
    ftthOnuId,
    onuEquipmentId: onu.networkEquipmentId || null
  }).where(eq(customerDevices.id, customerDeviceId))
}

export async function syncDasanMacMapToFtth(equipmentId: string, rows: DriverMacTableEntry[], mode: ImportMode): Promise<ImportAction[]> {
  const equipment = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, equipmentId) })
  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'OLT nie istnieje' })

  const knownOnus = await loadKnownFtthOnus(equipmentId)
  const knownByKey = new Map(knownOnus.map(onu => [`${onu.oltPort}:${onu.onuId}`, onu]))
  const knownById = new Map(knownOnus.map(onu => [onu.id, onu]))
  const knownMacs = await loadKnownMacs()
  const managementMacs = await loadManagementMacs(equipmentId)
  const managementIpHosts = await loadOnuIpHostsById(equipmentId)
  const actions = buildFtthMacMapPlan(rows, knownOnus, knownMacs, managementMacs, '400', equipment.inventoryId)
  if (mode !== 'apply') return actions

  const modelId = await getOrCreateOnuModelId()

  for (const row of rows) {
    const macAddress = normalizeFtthMac(row.macAddress)
    const onu = row.oltPort && row.onuId ? knownByKey.get(`${row.oltPort}:${row.onuId}`) : undefined
    if (!macAddress || !onu) continue

    const values = {
      vlanId: row.vlanId ? Number.parseInt(row.vlanId, 10) : null,
      gemId: row.gemId || null,
      sourceCommand: 'show olt mac',
      status: row.status || 'dynamic',
      lastSeenAt: new Date()
    }
    const existing = await db.query.ftthOnuMacs.findFirst({
      where: and(eq(ftthOnuMacs.onuId, onu.id), eq(ftthOnuMacs.macAddress, macAddress))
    })

    if (existing) {
      await db.update(ftthOnuMacs).set(values).where(eq(ftthOnuMacs.id, existing.id))
    } else {
      await db.insert(ftthOnuMacs).values({
        onuId: onu.id,
        macAddress,
        ...values
      })
    }
  }

  for (const action of actions) {
    if (action.entity === 'ftthOnu' && action.action === 'update' && typeof action.data.ftthOnuId === 'string') {
      const ftthOnuId = action.data.ftthOnuId as string
      await db.update(ftthOnus).set({ transparentCandidate: true }).where(eq(ftthOnus.id, ftthOnuId))

      const knownOnu = knownById.get(ftthOnuId)
      if (knownOnu) {
        const inventoryId = `${equipment.inventoryId}-ONU-${knownOnu.oltPort}-${knownOnu.onuId}`
        const existingEquipment = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, inventoryId) })
        const managementIp = await safeManagementIp(managementIpHosts.get(ftthOnuId) || [], existingEquipment?.id)
        const equipmentValues = {
          inventoryId,
          modelId,
          parentEquipmentId: equipmentId,
          hostname: inventoryId.toLowerCase(),
          managementIp: managementIp || existingEquipment?.managementIp || null,
          managementProtocol: managementIp ? existingEquipment?.managementProtocol || 'http' : existingEquipment?.managementProtocol || null,
          serialNumber: knownOnu.serialNumber || null,
          equipmentRole: 'CLIENT_PE',
          bridgeMode: true,
          onuPort: knownOnu.oltPort,
          onuId: knownOnu.onuId,
          isOnline: true,
          status: 'IN_USE',
          notes: `ONU zweryfikowana jako transparent bridge w OLT ${equipment.inventoryId}.`
        }
        const storedEquipment = existingEquipment
          ? await db.update(networkEquipment).set(equipmentValues).where(eq(networkEquipment.id, existingEquipment.id)).returning().then(rows => rows[0] || existingEquipment)
          : await db.insert(networkEquipment).values(equipmentValues).returning().then(rows => rows[0] || null)

        if (storedEquipment) {
          await db.update(ftthOnus).set({ networkEquipmentId: storedEquipment.id }).where(eq(ftthOnus.id, ftthOnuId))
        }
      }
      continue
    }

    if (action.entity !== 'ftthTransparentLink' || action.action !== 'link') continue
    const link = action.data.link
    const ftthOnuId = typeof action.data.ftthOnuId === 'string' ? action.data.ftthOnuId : null
    if (!ftthOnuId || !link || typeof link !== 'object') continue

    const typedLink = link as { macAddress?: string, linkType?: string, targetId?: string }
    const macAddress = normalizeFtthMac(typedLink.macAddress)
    if (!macAddress || !typedLink.linkType || !typedLink.targetId) continue

    const values = {
      linkType: typedLink.linkType,
      customerDeviceId: typedLink.linkType === 'CUSTOMER_DEVICE_BEHIND_ONU' ? typedLink.targetId : null,
      backboneEquipmentId: typedLink.linkType === 'BACKBONE_BEHIND_ONU' ? typedLink.targetId : null,
      confidence: 100,
      lastSeenAt: new Date()
    }
    const existing = await db.query.ftthTransparentLinks.findFirst({
      where: and(eq(ftthTransparentLinks.onuId, ftthOnuId), eq(ftthTransparentLinks.macAddress, macAddress))
    })

    if (existing) {
      await db.update(ftthTransparentLinks).set(values).where(eq(ftthTransparentLinks.id, existing.id))
    } else {
      await db.insert(ftthTransparentLinks).values({
        onuId: ftthOnuId,
        macAddress,
        ...values
      })
    }

    if (typedLink.linkType === 'CUSTOMER_DEVICE_BEHIND_ONU') {
      await linkCustomerDeviceToTransparentOnu(ftthOnuId, typedLink.targetId)
    }
  }

  return actions
}

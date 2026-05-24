import 'dotenv/config'
import { eq, isNotNull } from 'drizzle-orm'
import { customerDevices, ftthOnus, ftthTransparentLinks, networkEquipment } from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { getOrCreateOnuModelId } from '../server/utils/import-actions'

function normalizeMac(macAddress?: string | null) {
  return macAddress?.trim().replaceAll('-', ':').toLowerCase() || null
}

async function ensureOnuEquipment(ftthOnuId: string) {
  const onu = await db.query.ftthOnus.findFirst({
    where: eq(ftthOnus.id, ftthOnuId),
    with: {
      ponPort: {
        with: {
          olt: {
            with: {
              equipment: true
            }
          }
        }
      }
    }
  })
  if (!onu) return null
  if (onu.networkEquipmentId) return onu.networkEquipmentId

  const oltEquipment = onu.ponPort.olt.equipment
  const modelId = await getOrCreateOnuModelId()
  const inventoryId = `${oltEquipment.inventoryId}-ONU-${onu.ponPort.portCode}-${onu.onuIdentifier}`
  const values = {
    inventoryId,
    modelId,
    parentEquipmentId: oltEquipment.id,
    hostname: inventoryId.toLowerCase(),
    serialNumber: onu.serialNumber || null,
    equipmentRole: 'CLIENT_PE',
    bridgeMode: true,
    onuPort: onu.ponPort.portCode,
    onuId: onu.onuIdentifier,
    isOnline: onu.status?.toLowerCase() === 'active',
    status: 'IN_USE',
    notes: `ONU zweryfikowana jako transparent bridge w OLT ${oltEquipment.inventoryId}.`
  }
  const existingEquipment = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, inventoryId) })
  const storedEquipment = existingEquipment
    ? await db.update(networkEquipment).set(values).where(eq(networkEquipment.id, existingEquipment.id)).returning().then(rows => rows[0] || existingEquipment)
    : await db.insert(networkEquipment).values(values).returning().then(rows => rows[0] || null)

  if (!storedEquipment) return null
  await db.update(ftthOnus).set({
    networkEquipmentId: storedEquipment.id,
    transparentCandidate: true
  }).where(eq(ftthOnus.id, ftthOnuId))
  return storedEquipment.id
}

async function main() {
  const devices = await db.query.customerDevices.findMany({ where: isNotNull(customerDevices.macAddress) })
  const devicesByMac = new Map(devices.map(device => [normalizeMac(device.macAddress), device] as const))
  const macRows = await db.query.ftthOnuMacs.findMany()
  const downstreamRowsByOnu = new Map<string, typeof macRows>()
  for (const macRow of macRows) {
    if (macRow.vlanId === 400) continue
    downstreamRowsByOnu.set(macRow.onuId, [...(downstreamRowsByOnu.get(macRow.onuId) || []), macRow])
  }
  const transparentOnuIds = new Set(Array.from(downstreamRowsByOnu.entries())
    .filter(([, rows]) => new Set(rows.map(row => normalizeMac(row.macAddress)).filter(Boolean)).size > 1)
    .map(([onuId]) => onuId))
  let createdLinks = 0
  let updatedLinks = 0
  let linkedDevices = 0
  let removedLinks = 0
  let clearedDevices = 0
  let ensuredTransparentEquipment = 0

  for (const onuId of transparentOnuIds) {
    const equipmentId = await ensureOnuEquipment(onuId)
    if (equipmentId) ensuredTransparentEquipment += 1
  }

  const existingLinks = await db.query.ftthTransparentLinks.findMany()
  for (const link of existingLinks) {
    if (transparentOnuIds.has(link.onuId)) continue
    if (link.customerDeviceId) {
      await db.update(customerDevices).set({
        ftthOnuId: null,
        onuEquipmentId: null
      }).where(eq(customerDevices.id, link.customerDeviceId))
      clearedDevices += 1
    }
    await db.delete(ftthTransparentLinks).where(eq(ftthTransparentLinks.id, link.id))
    await db.update(ftthOnus).set({
      transparentCandidate: false,
      networkEquipmentId: null
    }).where(eq(ftthOnus.id, link.onuId))
    removedLinks += 1
  }

  for (const macRow of macRows) {
    if (!transparentOnuIds.has(macRow.onuId)) continue
    if (macRow.vlanId === 400) continue
    const device = devicesByMac.get(normalizeMac(macRow.macAddress))
    if (!device) continue
    const onuEquipmentId = await ensureOnuEquipment(macRow.onuId)
    const existing = await db.query.ftthTransparentLinks.findFirst({
      where: eq(ftthTransparentLinks.macAddress, macRow.macAddress)
    })
    const values = {
      onuId: macRow.onuId,
      macAddress: macRow.macAddress,
      linkType: 'CUSTOMER_DEVICE_BEHIND_ONU',
      customerDeviceId: device.id,
      backboneEquipmentId: null,
      confidence: 100,
      lastSeenAt: new Date()
    }
    if (existing) {
      await db.update(ftthTransparentLinks).set(values).where(eq(ftthTransparentLinks.id, existing.id))
      updatedLinks += 1
    } else {
      await db.insert(ftthTransparentLinks).values(values)
      createdLinks += 1
    }
    await db.update(customerDevices).set({
      ftthOnuId: macRow.onuId,
      onuEquipmentId
    }).where(eq(customerDevices.id, device.id))
    linkedDevices += 1
  }

  const links = await db.query.ftthTransparentLinks.findMany({
    where: isNotNull(ftthTransparentLinks.customerDeviceId)
  })
  let updated = 0
  let skipped = 0

  for (const link of links) {
    if (!link.customerDeviceId) {
      skipped += 1
      continue
    }
    const onu = await db.query.ftthOnus.findFirst({ where: eq(ftthOnus.id, link.onuId) })
    if (!onu) {
      skipped += 1
      continue
    }

    await db.update(customerDevices).set({
      ftthOnuId: link.onuId,
      onuEquipmentId: onu.networkEquipmentId || null
    }).where(eq(customerDevices.id, link.customerDeviceId))
    updated += 1
  }

  console.log(JSON.stringify({
    ok: true,
    transparentOnus: transparentOnuIds.size,
    ensuredTransparentEquipment,
    scannedExistingLinks: links.length,
    createdLinks,
    updatedLinks,
    removedLinks,
    linkedDevices,
    clearedDevices,
    backfilledFromExistingLinks: updated,
    skipped
  }, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

import { eq } from 'drizzle-orm'
import { createNetworkDriver } from '../network-drivers/registry'
import type { DriverEquipment, NetworkManagementDriver } from '../network-drivers/types'
import { managementDrivers, networkEquipment } from '../db/schema'
import { db } from './db'
import { decryptAccessProfileSecrets } from './secrets'

export async function loadManagedEquipment(equipmentId: string) {
  return await db.query.networkEquipment.findFirst({
    where: eq(networkEquipment.id, equipmentId),
    with: {
      accessProfile: true,
      managementDriver: true,
      parentEquipment: {
        with: {
          accessProfile: true,
          managementDriver: true
        }
      }
    }
  })
}

export function toDriverEquipment(equipment: NonNullable<Awaited<ReturnType<typeof loadManagedEquipment>>>): DriverEquipment {
  return {
    id: equipment.id,
    inventoryId: equipment.inventoryId,
    hostname: equipment.hostname,
    managementIp: equipment.managementIp,
    managementPort: equipment.managementPort,
    managementProtocol: equipment.managementProtocol,
    macAddress: equipment.macAddress,
    serialNumber: equipment.serialNumber,
    onuPort: equipment.onuPort,
    onuId: equipment.onuId,
    accessProfile: equipment.accessProfile ? decryptAccessProfileSecrets(equipment.accessProfile) : null
  }
}

export async function getDriverForEquipment(equipmentId: string): Promise<{
  equipment: NonNullable<Awaited<ReturnType<typeof loadManagedEquipment>>>
  driverCode: string
  driver: NetworkManagementDriver
}> {
  const equipment = await loadManagedEquipment(equipmentId)
  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'Urządzenie nie istnieje' })

  const driverCode = equipment.managementDriver?.code || equipment.managementProtocol || 'mock'
  return {
    equipment,
    driverCode,
    driver: createNetworkDriver(driverCode, toDriverEquipment(equipment))
  }
}

export async function ensureDriverSeed(code: string, label: string, transport: string, capabilities: Record<string, unknown>) {
  const [driver] = await db.insert(managementDrivers)
    .values({ code, label, transport, capabilities })
    .onConflictDoNothing()
    .returning()

  return driver || await db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, code) })
}

import { apiHandler } from '../../../utils/api-handler'
import { getDriverForEquipment } from '../../../utils/network-driver-context'
import { equipmentConfigBackups } from '../../../db/schema'
import { db } from '../../../utils/db'
import { z } from 'zod'
import crypto from 'node:crypto'

const bodySchema = z.object({
  equipmentId: z.string().uuid()
})

export default apiHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))

  const { driver, driverCode, equipment } = await getDriverForEquipment(body.equipmentId)
  const commandTree = await driver.getCommandTree()

  const configText = commandTree.data
    ? JSON.stringify(commandTree.data, null, 2)
    : commandTree.message || 'Brak konfiguracji'

  const backupHash = crypto.createHash('sha256').update(configText).digest('hex')

  const [row] = await db.insert(equipmentConfigBackups).values({
    equipmentId: equipment.id,
    configText,
    configSize: configText.length,
    triggerType: 'manual',
    status: 'success',
    backupHash,
    equipmentSnapshot: {
      inventoryId: equipment.inventoryId,
      hostname: equipment.hostname,
      managementIp: equipment.managementIp,
      driver: driverCode
    }
  }).returning()

  return {
    success: true,
    data: row
      ? { id: row.id, backupHash: backupHash.slice(0, 16), configSize: configText.length, createdAt: row.createdAt }
      : { id: null, backupHash: backupHash.slice(0, 16), configSize: configText.length, createdAt: null }
  }
})

import { readBody } from 'h3'
import { networkEquipment } from '../../../db/schema'
import { createEquipmentSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createEquipmentSchema.parse(body)
  const [equipment] = await db.insert(networkEquipment).values(payload).returning()

  return { success: true, data: equipment }
})

import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { networkEquipment } from '../../../db/schema'
import { updateEquipmentSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const payload = updateEquipmentSchema.parse(await readBody(event))
  const [equipment] = await db.update(networkEquipment)
    .set(definedEntries(payload))
    .where(eq(networkEquipment.id, id))
    .returning()

  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'Urządzenie nie istnieje' })
  return { success: true, data: equipment }
})

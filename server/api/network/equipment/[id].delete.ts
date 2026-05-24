import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { networkEquipment } from '../../../db/schema'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const [equipment] = await db.delete(networkEquipment)
    .where(eq(networkEquipment.id, id))
    .returning()

  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'Urządzenie nie istnieje' })
  return { success: true, data: equipment }
})

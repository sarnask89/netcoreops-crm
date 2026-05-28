import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { payments } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id platnosci' })

  const [payment] = await db.delete(payments)
    .where(eq(payments.id, id))
    .returning()

  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Platnosc nie istnieje' })
  return { success: true, data: payment }
})

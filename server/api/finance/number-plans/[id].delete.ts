import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { numberPlans } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id planu numeracji' })

  const [plan] = await db.delete(numberPlans)
    .where(eq(numberPlans.id, id))
    .returning()

  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan numeracji nie istnieje' })
  return { success: true, data: plan }
})

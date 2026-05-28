import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { numberPlans } from '../../../db/schema'
import { updateNumberPlanSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id planu numeracji' })

  const payload = updateNumberPlanSchema.parse(await readBody(event))

  const [plan] = await db.update(numberPlans)
    .set(definedEntries(payload as Record<string, unknown>))
    .where(eq(numberPlans.id, id))
    .returning()

  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan numeracji nie istnieje' })
  return { success: true, data: plan }
})

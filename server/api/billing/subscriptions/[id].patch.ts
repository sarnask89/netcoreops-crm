import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { subscriptions } from '../../../db/schema'
import { updateSubscriptionSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id subskrypcji' })

  const payload = updateSubscriptionSchema.parse(await readBody(event))
  const updateData = {
    ...payload,
    priceOverrideNet: payload.priceOverrideNet === undefined ? undefined : payload.priceOverrideNet == null ? null : String(payload.priceOverrideNet),
    discountPercent: payload.discountPercent === undefined ? undefined : String(payload.discountPercent),
    activationFee: payload.activationFee === undefined ? undefined : String(payload.activationFee)
  }
  const [subscription] = await db.update(subscriptions)
    .set(definedEntries(updateData))
    .where(eq(subscriptions.id, id))
    .returning()

  if (!subscription) throw createError({ statusCode: 404, statusMessage: 'Subskrypcja nie istnieje' })
  return { success: true, data: subscription }
})

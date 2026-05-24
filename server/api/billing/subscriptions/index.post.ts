import { readBody } from 'h3'
import { subscriptions } from '../../../db/schema'
import { createSubscriptionSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createSubscriptionSchema.parse(body)
  const [subscription] = await db.insert(subscriptions).values({
    ...payload,
    priceOverrideNet: payload.priceOverrideNet == null ? null : String(payload.priceOverrideNet),
    discountPercent: String(payload.discountPercent),
    activationFee: String(payload.activationFee)
  }).returning()

  return { success: true, data: subscription }
})

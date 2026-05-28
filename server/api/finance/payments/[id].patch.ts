import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { payments } from '../../../db/schema'
import { updatePaymentSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id platnosci' })

  const payload = updatePaymentSchema.parse(await readBody(event))
  const updateData = {
    ...payload,
    amount: payload.amount === undefined ? undefined : String(payload.amount)
  }

  const [payment] = await db.update(payments)
    .set(definedEntries(updateData as Record<string, unknown>))
    .where(eq(payments.id, id))
    .returning()

  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Platnosc nie istnieje' })
  return { success: true, data: payment }
})

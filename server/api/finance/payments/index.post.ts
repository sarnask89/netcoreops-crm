import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { payments } from '../../../db/schema'
import { createPaymentSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { dispatchNotificationEvent } from '../../../utils/notification-dispatch'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createPaymentSchema.parse(body)

  const [payment] = await db.insert(payments).values({
    ...payload,
    documentId: payload.documentId ?? null,
    amount: String(payload.amount)
  }).returning()

  if (payment) {
    await dispatchNotificationEvent({
      eventType: 'payment_received',
      customerId: payment.customerId,
      relatedEntityType: 'payment',
      relatedEntityId: payment.id,
      variables: {
        payment_id: payment.id,
        payment_amount: payment.amount,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod ?? '',
        payment_reference: payment.reference ?? '',
        document_id: payment.documentId ?? '',
        customer_id: payment.customerId
      }
    })
  }

  return { success: true, data: payment }
})

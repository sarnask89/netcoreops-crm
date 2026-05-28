import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const paymentsList = await db.query.payments.findMany({
    where: (table, { eq }) => eq(table.customerId, session.customerId),
    orderBy: (table, { desc }) => [desc(table.paymentDate)],
    with: {
      document: {
        columns: {
          fullNumber: true
        }
      }
    }
  })

  return {
    success: true,
    data: paymentsList.map(p => ({
      id: p.id,
      amount: p.amount,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      reference: p.reference,
      documentId: p.documentId,
      documentFullNumber: p.document?.fullNumber ?? null
    }))
  }
})

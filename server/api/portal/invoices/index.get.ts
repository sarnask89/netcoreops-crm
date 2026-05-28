import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const invoices = await db.query.documents.findMany({
    where: (table, { eq, and }) => and(
      eq(table.customerId, session.customerId),
      eq(table.type, 'invoice')
    ),
    orderBy: (table, { desc }) => [desc(table.issueDate)]
  })

  return {
    success: true,
    data: invoices.map(inv => ({
      id: inv.id,
      fullNumber: inv.fullNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      totalGross: inv.totalGross,
      paymentStatus: inv.paymentStatus,
      isCancelled: inv.isCancelled
    }))
  }
})

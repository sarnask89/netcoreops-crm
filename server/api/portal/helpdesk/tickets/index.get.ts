import { apiHandler } from '../../../../utils/api-handler'
import { getPortalSession } from '../../../../utils/portal-auth'
import { db } from '../../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const tickets = await db.query.tickets.findMany({
    where: (table, { eq }) => eq(table.customerId, session.customerId),
    with: {
      category: true,
      messages: {
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit: 1
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: tickets }
})

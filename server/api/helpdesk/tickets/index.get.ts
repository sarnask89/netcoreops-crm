import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { getQuery } from 'h3'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const customerId = query.customerId as string | undefined

  const tickets = await db.query.tickets.findMany({
    where: customerId
      ? (table, { eq }) => eq(table.customerId, customerId)
      : undefined,
    with: { customer: true, category: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: tickets }
})

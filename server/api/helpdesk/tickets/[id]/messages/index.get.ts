import { apiHandler } from '../../../../../utils/api-handler'
import { db } from '../../../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { ticketMessages } from '../../../../../db/schema'

export default apiHandler(async (event) => {
  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const messages = await db.query.ticketMessages.findMany({
    where: eq(ticketMessages.ticketId, ticketId),
    orderBy: (table, { asc }) => [asc(table.createdAt)]
  })

  return { success: true, data: messages }
})

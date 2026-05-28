import { apiHandler } from '../../../../../utils/api-handler'
import { getPortalSession } from '../../../../../utils/portal-auth'
import { db } from '../../../../../utils/db'
import { getRouterParam } from 'h3'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const ticket = await db.query.tickets.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, id), eq(table.customerId, session.customerId)),
    with: {
      category: true,
      messages: {
        orderBy: (table, { asc }) => [asc(table.createdAt)]
      }
    }
  })

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono zgłoszenia' })

  return { success: true, data: ticket }
})

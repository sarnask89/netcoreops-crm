import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { getRouterParam } from 'h3'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const ticket = await db.query.tickets.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      customer: true,
      category: true,
      messages: {
        orderBy: (table, { asc }) => [asc(table.createdAt)]
      }
    }
  })

  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono zgłoszenia' })

  return { success: true, data: ticket }
})

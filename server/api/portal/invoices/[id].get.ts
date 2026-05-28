import { getRouterParam } from 'h3'
import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak identyfikatora faktury' })

  const document = await db.query.documents.findFirst({
    where: (table, { eq, and }) => and(
      eq(table.id, id),
      eq(table.customerId, session.customerId)
    ),
    with: {
      items: {
        orderBy: (table, { asc }) => [asc(table.ordinal)]
      },
      payments: true
    }
  })

  if (!document) {
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono faktury' })
  }

  return { success: true, data: document }
})

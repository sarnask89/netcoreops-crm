import { apiHandler } from '../../../../utils/api-handler'
import { getPortalSession } from '../../../../utils/portal-auth'
import { db } from '../../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const categories = await db.query.ticketCategories.findMany({
    where: (table, { eq }) => eq(table.isActive, true),
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.name)]
  })

  return { success: true, data: categories }
})

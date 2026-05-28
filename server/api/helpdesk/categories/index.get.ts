import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const categories = await db.query.ticketCategories.findMany({
    orderBy: (table, { asc }) => [asc(table.sortOrder)]
  })

  return { success: true, data: categories }
})

import { apiHandler } from '../../../utils/api-handler'
import { searchCatalog } from '../../../db/schema'
import { asc } from 'drizzle-orm'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const items = await db.query.searchCatalog.findMany({
    orderBy: [asc(searchCatalog.sortOrder), asc(searchCatalog.label)]
  })

  return { success: true, data: items }
})

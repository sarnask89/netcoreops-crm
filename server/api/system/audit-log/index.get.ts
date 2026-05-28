import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { auditLogs } from '../../../db/schema'
import { desc, ilike } from 'drizzle-orm'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string | undefined
  const limit = Math.min(Number(query.limit) || 100, 500)

  let queryBuilder = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).$dynamic()

  if (search) {
    queryBuilder = queryBuilder.where(
      ilike(auditLogs.entity, `%${search}%`)
    )
  }

  const rows = await queryBuilder
  return { success: true, data: rows }
})

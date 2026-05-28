import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { equipmentConfigBackups } from '../../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const equipmentId = query.equipmentId as string | undefined
  const limit = Math.min(Number(query.limit) || 200, 500)

  let queryBuilder = db.select().from(equipmentConfigBackups).orderBy(desc(equipmentConfigBackups.createdAt)).limit(limit).$dynamic()

  if (equipmentId) {
    queryBuilder = queryBuilder.where(eq(equipmentConfigBackups.equipmentId, equipmentId))
  }

  const rows = await queryBuilder
  return { success: true, data: rows }
})

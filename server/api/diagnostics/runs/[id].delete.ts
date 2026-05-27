import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { diagnosticRuns } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id diagnostyki' })

  const [deleted] = await db.delete(diagnosticRuns)
    .where(eq(diagnosticRuns.id, id))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Wpis diagnostyki nie istnieje' })
  return { success: true, data: deleted }
})

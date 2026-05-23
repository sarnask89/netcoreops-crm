import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { importRuns } from '../../../db/schema'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id importu' })

  const [deleted] = await db.delete(importRuns)
    .where(eq(importRuns.id, id))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Import nie istnieje' })
  return { success: true, data: deleted }
})

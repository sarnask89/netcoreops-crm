import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { documents } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id dokumentu' })

  const result = await db.delete(documents)
    .where(eq(documents.id, id))
    .returning()
  const doc = result[0]

  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Dokument nie istnieje' })
  return { success: true, data: doc }
})

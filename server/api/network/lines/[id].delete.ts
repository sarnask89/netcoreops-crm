import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { networkLines } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id linii' })

  const [line] = await db.delete(networkLines)
    .where(eq(networkLines.id, id))
    .returning()

  if (!line) throw createError({ statusCode: 404, statusMessage: 'Linia nie istnieje' })
  return { success: true, data: line }
})

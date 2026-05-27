import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { networkNodes } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id węzła' })

  const [node] = await db.delete(networkNodes)
    .where(eq(networkNodes.id, id))
    .returning()

  if (!node) throw createError({ statusCode: 404, statusMessage: 'Węzeł nie istnieje' })
  return { success: true, data: node }
})

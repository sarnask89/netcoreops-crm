import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { searchCatalog } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const [item] = await db.delete(searchCatalog)
    .where(eq(searchCatalog.id, id))
    .returning()

  if (!item) {
    throw createError({ statusCode: 404, message: 'Nie znaleziono wpisu katalogu wyszukiwarki' })
  }

  return { success: true }
})

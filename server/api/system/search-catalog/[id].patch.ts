import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { searchCatalog } from '../../../db/schema'
import { updateSearchCatalogSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = updateSearchCatalogSchema.parse(body)
  const [item] = await db.update(searchCatalog)
    .set(payload)
    .where(eq(searchCatalog.id, id))
    .returning()

  if (!item) {
    throw createError({ statusCode: 404, message: 'Nie znaleziono wpisu katalogu wyszukiwarki' })
  }

  return { success: true, data: item }
})

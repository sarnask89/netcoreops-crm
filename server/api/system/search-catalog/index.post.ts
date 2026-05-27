import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { searchCatalog } from '../../../db/schema'
import { createSearchCatalogSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createSearchCatalogSchema.parse(body)
  const [item] = await db.insert(searchCatalog).values(payload).returning()

  return { success: true, data: item }
})

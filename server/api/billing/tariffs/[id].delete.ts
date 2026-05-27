import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { tariffs } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id taryfy' })

  const [tariff] = await db.delete(tariffs)
    .where(eq(tariffs.id, id))
    .returning()

  if (!tariff) throw createError({ statusCode: 404, statusMessage: 'Taryfa nie istnieje' })
  return { success: true, data: tariff }
})

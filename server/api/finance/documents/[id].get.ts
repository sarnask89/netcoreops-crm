import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { documents } from '../../../db/schema'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id dokumentu' })

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      customer: true,
      numberPlan: true,
      items: {
        with: {
          tariff: true,
          subscription: true
        }
      },
      payments: true
    }
  })

  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Dokument nie istnieje' })
  return { success: true, data: doc }
})

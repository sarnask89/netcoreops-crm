import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { ticketCategories } from '../../../../db/schema'
import { updateTicketCategorySchema } from '../../../../utils/api-validation'

export default apiHandler(async (event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) throw createError({ statusCode: 400, statusMessage: 'Brak id kategorii' })
  const id = Number(idStr)
  if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Niepoprawne id' })

  const body = await readBody(event)
  const payload = updateTicketCategorySchema.parse(body)

  const [updated] = await db.update(ticketCategories)
    .set(payload)
    .where(eq(ticketCategories.id, id))
    .returning()

  return { success: true, data: updated }
})

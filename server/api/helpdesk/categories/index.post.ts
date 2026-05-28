import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { ticketCategories } from '../../../db/schema'
import { createTicketCategorySchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createTicketCategorySchema.parse(body)

  const [category] = await db.insert(ticketCategories).values({
    name: payload.name,
    description: payload.description ?? null,
    color: payload.color ?? null,
    sortOrder: payload.sortOrder,
    isActive: payload.isActive
  }).returning()

  return { success: true, data: category }
})

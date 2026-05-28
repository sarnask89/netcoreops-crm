import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { tickets } from '../../../../db/schema'
import { updateTicketSchema } from '../../../../utils/api-validation'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const body = await readBody(event)
  const payload = updateTicketSchema.parse(body)

  await db.update(tickets)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(tickets.id, id))

  const updated = await db.query.tickets.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: { customer: true, category: true }
  })

  return { success: true, data: updated }
})

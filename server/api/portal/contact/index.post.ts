import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { tickets, ticketMessages } from '../../../db/schema'
import { z } from 'zod'

const contactSchema = z.object({
  subject: z.string().min(1).max(255),
  message: z.string().min(1),
  categoryId: z.number().int().positive().nullable().optional()
})

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const body = await readBody(event)
  const payload = contactSchema.parse(body)

  const [ticket] = await db.insert(tickets).values({
    subject: payload.subject,
    customerId: session.customerId,
    categoryId: payload.categoryId ?? null,
    source: 'portal',
    assignedTo: null
  }).returning()

  if (!ticket) throw createError({ statusCode: 500, statusMessage: 'Nie udało się utworzyć zgłoszenia' })

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    author: session.customerName,
    content: payload.message,
    isInternal: false
  })

  return { success: true }
})

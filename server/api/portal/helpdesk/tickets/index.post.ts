import { apiHandler } from '../../../../utils/api-handler'
import { getPortalSession } from '../../../../utils/portal-auth'
import { db } from '../../../../utils/db'
import { readBody } from 'h3'
import { tickets, ticketMessages } from '../../../../db/schema'
import { z } from 'zod'
import { notifyTicketEvent } from '../../../../utils/helpdesk-notifications'

const portalCreateTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  categoryId: z.number().int().positive().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  message: z.string().min(1)
})

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const body = await readBody(event)
  const payload = portalCreateTicketSchema.parse(body)

  const [ticket] = await db.insert(tickets).values({
    subject: payload.subject,
    priority: payload.priority,
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

  await notifyTicketEvent({
    ticketId: ticket.id,
    eventType: 'ticket_created',
    actorName: session.customerName,
    message: payload.message
  })

  const created = await db.query.tickets.findFirst({
    where: (table, { eq }) => eq(table.id, ticket.id),
    with: { category: true, messages: true }
  })

  return { success: true, data: created }
})

import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { tickets, ticketMessages } from '../../../db/schema'
import { createTicketSchema } from '../../../utils/api-validation'
import { notifyTicketEvent } from '../../../utils/helpdesk-notifications'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createTicketSchema.parse(body)

  const { message, ...ticketFields } = payload

  const [ticket] = await db.insert(tickets).values({
    subject: ticketFields.subject,
    status: ticketFields.status,
    priority: ticketFields.priority,
    customerId: ticketFields.customerId,
    categoryId: ticketFields.categoryId ?? null,
    assignedTo: ticketFields.assignedTo ?? null,
    source: ticketFields.source
  }).returning()

  if (!ticket) throw createError({ statusCode: 500, statusMessage: 'Nie udało się utworzyć zgłoszenia' })

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    author: ticketFields.assignedTo || 'System',
    content: message,
    isInternal: false
  })

  await notifyTicketEvent({
    ticketId: ticket.id,
    eventType: 'ticket_created',
    actorName: ticketFields.assignedTo || 'Administrator',
    message
  })

  const created = await db.query.tickets.findFirst({
    where: (table, { eq }) => eq(table.id, ticket.id),
    with: { customer: true, category: true, messages: true }
  })

  return { success: true, data: created }
})

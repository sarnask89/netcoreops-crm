import { eq } from 'drizzle-orm'
import { tickets } from '../db/schema'
import { db } from './db'
import { dispatchNotificationEvent } from './notification-dispatch'

type TicketEventType = 'ticket_created' | 'ticket_reply'

interface TicketNotificationOptions {
  ticketId: string
  eventType: TicketEventType
  actorName: string
  message?: string
}

export async function notifyTicketEvent(options: TicketNotificationOptions) {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, options.ticketId),
    with: { customer: true, category: true }
  })
  if (!ticket) return

  const variables = {
    ticket_id: ticket.id,
    ticket_subject: ticket.subject,
    ticket_status: ticket.status,
    ticket_priority: ticket.priority,
    ticket_category: ticket.category?.name ?? '',
    customer_name: ticket.customer?.fullName ?? '',
    actor_name: options.actorName,
    message: options.message ?? ''
  }

  await dispatchNotificationEvent({
    eventType: options.eventType,
    variables,
    customerId: ticket.customerId,
    customerEmail: ticket.customer?.contactEmail,
    relatedEntityType: 'ticket',
    relatedEntityId: ticket.id
  })
}

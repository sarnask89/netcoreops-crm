import { apiHandler } from '../../../../../../utils/api-handler'
import { getPortalSession } from '../../../../../../utils/portal-auth'
import { db } from '../../../../../../utils/db'
import { readBody, getRouterParam } from 'h3'
import { ticketMessages, tickets } from '../../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { notifyTicketEvent } from '../../../../../../utils/helpdesk-notifications'

const portalAddMessageSchema = z.object({
  content: z.string().min(1)
})

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const ticket = await db.query.tickets.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, ticketId), eq(table.customerId, session.customerId))
  })
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono zgłoszenia' })

  const body = await readBody(event)
  const payload = portalAddMessageSchema.parse(body)

  const [msg] = await db.insert(ticketMessages).values({
    ticketId,
    author: session.customerName,
    content: payload.content,
    isInternal: false
  }).returning()

  await db.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticketId))

  await notifyTicketEvent({
    ticketId,
    eventType: 'ticket_reply',
    actorName: session.customerName,
    message: payload.content
  })

  return { success: true, data: msg }
})

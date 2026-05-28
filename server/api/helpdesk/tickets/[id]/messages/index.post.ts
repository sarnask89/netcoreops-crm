import { apiHandler } from '../../../../../utils/api-handler'
import { db } from '../../../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { ticketMessages, tickets } from '../../../../../db/schema'
import { addTicketMessageSchema } from '../../../../../utils/api-validation'
import { notifyTicketEvent } from '../../../../../utils/helpdesk-notifications'

export default apiHandler(async (event) => {
  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Brak id zgłoszenia' })

  const body = await readBody(event)
  const payload = addTicketMessageSchema.parse(body)

  const [msg] = await db.insert(ticketMessages).values({
    ticketId,
    author: payload.author,
    content: payload.content,
    isInternal: payload.isInternal,
    attachments: payload.attachments ?? []
  }).returning()

  await db.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticketId))

  if (!payload.isInternal) {
    await notifyTicketEvent({
      ticketId,
      eventType: 'ticket_reply',
      actorName: payload.author,
      message: payload.content
    })
  }

  return { success: true, data: msg }
})

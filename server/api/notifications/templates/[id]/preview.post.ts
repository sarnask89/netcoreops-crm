import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { emailTemplates } from '../../../../db/schema'
import { renderNotificationTemplate } from '../../../../utils/notification-render'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ variables?: Record<string, string> }>(event)
  const vars = body.variables ?? {}

  const template = await db.query.emailTemplates.findFirst({ where: eq(emailTemplates.id, id) })
  if (!template) throw createError({ statusCode: 404, statusMessage: 'Szablon nie istnieje' })

  const subject = renderNotificationTemplate(template.subject, vars)
  const html = renderNotificationTemplate(template.bodyHtml, vars)

  return { success: true, data: { subject, html } }
})

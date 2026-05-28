import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { emailTemplates } from '../../../db/schema'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const template = await db.query.emailTemplates.findFirst({
    where: eq(emailTemplates.id, id),
    with: { smtpConfig: true }
  })
  if (!template) throw createError({ statusCode: 404, statusMessage: 'Szablon nie istnieje' })
  return { success: true, data: template }
})

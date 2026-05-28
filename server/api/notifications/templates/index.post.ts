import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { emailTemplates } from '../../../db/schema'
import { createEmailTemplateSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createEmailTemplateSchema.parse(body)
  const result = await db.insert(emailTemplates).values({
    name: payload.name,
    code: payload.code,
    subject: payload.subject,
    bodyHtml: payload.bodyHtml,
    variables: payload.variables ?? [],
    smtpConfigId: payload.smtpConfigId ?? null,
    isActive: payload.isActive
  }).returning()
  return { success: true, data: result[0] }
})

import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { emailTemplates } from '../../../db/schema'
import { updateEmailTemplateSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = updateEmailTemplateSchema.parse(body)
  const result = await db.update(emailTemplates).set({
    ...payload,
    smtpConfigId: payload.smtpConfigId ?? undefined
  }).where(eq(emailTemplates.id, id)).returning()
  return { success: true, data: result[0] }
})

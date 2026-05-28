import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { notificationRules } from '../../../db/schema'
import { updateNotificationRuleSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = updateNotificationRuleSchema.parse(body)
  const result = await db.update(notificationRules).set({
    ...payload,
    templateId: payload.templateId ?? undefined
  }).where(eq(notificationRules.id, id)).returning()
  return { success: true, data: result[0] }
})

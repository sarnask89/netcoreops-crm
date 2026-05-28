import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { notificationRules } from '../../../db/schema'
import { createNotificationRuleSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createNotificationRuleSchema.parse(body)
  const result = await db.insert(notificationRules).values({
    name: payload.name,
    eventType: payload.eventType,
    templateId: payload.templateId ?? null,
    recipients: payload.recipients,
    conditions: payload.conditions ?? {},
    enabled: payload.enabled
  }).returning()
  return { success: true, data: result[0] }
})

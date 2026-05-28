import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { smtpConfigs } from '../../../db/schema'
import { updateSmtpConfigSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = updateSmtpConfigSchema.parse(body)

  if (payload.isDefault) {
    await db.update(smtpConfigs).set({ isDefault: false }).where(eq(smtpConfigs.isDefault, true))
  }

  const result = await db.update(smtpConfigs).set(payload).where(eq(smtpConfigs.id, id)).returning()
  return { success: true, data: result[0] }
})

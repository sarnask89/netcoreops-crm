import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody } from 'h3'
import { smtpConfigs } from '../../../db/schema'
import { createSmtpConfigSchema } from '../../../utils/api-validation'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createSmtpConfigSchema.parse(body)

  if (payload.isDefault) {
    await db.update(smtpConfigs).set({ isDefault: false }).where(eq(smtpConfigs.isDefault, true))
  }

  const result = await db.insert(smtpConfigs).values(payload).returning()
  return { success: true, data: result[0] }
})

import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { readBody } from 'h3'
import { smtpConfigs } from '../../../db/schema'

export default apiHandler(async (event) => {
  const { id } = await readBody(event)
  await db.update(smtpConfigs).set({ isDefault: false }).where(eq(smtpConfigs.isDefault, true))
  await db.update(smtpConfigs).set({ isDefault: true }).where(eq(smtpConfigs.id, id))
  return { success: true }
})

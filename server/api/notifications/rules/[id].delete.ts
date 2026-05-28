import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { notificationRules } from '../../../db/schema'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await db.delete(notificationRules).where(eq(notificationRules.id, id))
  return { success: true }
})

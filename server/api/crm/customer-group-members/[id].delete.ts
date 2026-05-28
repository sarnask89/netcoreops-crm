import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { customerGroupMembers } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id' })

  await db.delete(customerGroupMembers).where(eq(customerGroupMembers.id, id))
  return { success: true }
})

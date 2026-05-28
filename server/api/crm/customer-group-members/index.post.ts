import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { customerGroupMembers } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  groupId: z.number(),
  customerId: z.string().uuid()
})

export default apiHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const body = bodySchema.parse(await readBody(event))

  const existing = await db.select().from(customerGroupMembers)
    .where(and(
      eq(customerGroupMembers.groupId, body.groupId),
      eq(customerGroupMembers.customerId, body.customerId)
    ))
    .limit(1)

  if (existing.length) {
    return { success: true, data: existing[0] }
  }

  const [row] = await db.insert(customerGroupMembers).values(body).returning()
  return { success: true, data: row }
})

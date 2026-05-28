import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { customerGroups } from '../../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().optional()
})

export default apiHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const rows = await db.select().from(customerGroups).orderBy(desc(customerGroups.createdAt))
    return { success: true, data: rows }
  }

  if (method === 'POST') {
    const body = groupSchema.parse(await readBody(event))
    const [row] = await db.insert(customerGroups).values(body).returning()
    return { success: true, data: row }
  }
})

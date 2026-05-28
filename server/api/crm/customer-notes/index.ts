import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { customerNotes } from '../../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const noteSchema = z.object({
  customerId: z.string().uuid(),
  content: z.string().min(1),
  isInternal: z.boolean().optional().default(true),
  category: z.string().optional().nullable()
})

export default apiHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const { customerId } = getQuery(event)
    if (!customerId || typeof customerId !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Brak customerId' })
    }

    const rows = await db.select().from(customerNotes)
      .where(eq(customerNotes.customerId, customerId))
      .orderBy(desc(customerNotes.createdAt))
      .limit(200)

    return { success: true, data: rows }
  }

  if (method === 'POST') {
    const body = noteSchema.parse(await readBody(event))
    const session = (event.context as any).session
    const author = session?.displayName || session?.username || 'system'

    const [row] = await db.insert(customerNotes).values({
      ...body,
      author
    }).returning()

    return { success: true, data: row }
  }
})

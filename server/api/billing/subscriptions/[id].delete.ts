import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { subscriptions } from '../../../db/schema'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id subskrypcji' })

  const [subscription] = await db.delete(subscriptions)
    .where(eq(subscriptions.id, id))
    .returning()

  if (!subscription) throw createError({ statusCode: 404, statusMessage: 'Subskrypcja nie istnieje' })
  return { success: true, data: subscription }
})

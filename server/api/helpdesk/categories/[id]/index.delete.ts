import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { ticketCategories } from '../../../../db/schema'

export default apiHandler(async (event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) throw createError({ statusCode: 400, statusMessage: 'Brak id kategorii' })
  const id = Number(idStr)
  if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Niepoprawne id' })

  await db.delete(ticketCategories).where(eq(ticketCategories.id, id))

  return { success: true }
})

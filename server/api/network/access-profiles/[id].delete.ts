import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { accessProfiles } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id profilu' })

  const [profile] = await db.delete(accessProfiles)
    .where(eq(accessProfiles.id, id))
    .returning()

  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Profil nie istnieje' })
  return { success: true, data: profile }
})

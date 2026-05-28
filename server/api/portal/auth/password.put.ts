import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { portalUsers } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { verifyPassword, hashPassword } from '../../../utils/password'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
})

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const body = await readBody(event)
  const payload = changePasswordSchema.parse(body)

  const user = await db.query.portalUsers.findFirst({
    where: (table, { eq }) => eq(table.id, session.portalUserId)
  })

  if (!user) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono użytkownika portalu' })

  const valid = await verifyPassword(payload.currentPassword, user.passwordHash)
  if (!valid) throw createError({ statusCode: 400, statusMessage: 'Nieprawidłowe bieżące hasło' })

  const newHash = await hashPassword(payload.newPassword)

  await db.update(portalUsers)
    .set({ passwordHash: newHash })
    .where(eq(portalUsers.id, session.portalUserId))

  return { success: true }
})

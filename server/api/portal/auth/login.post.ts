import { apiHandler } from '../../../utils/api-handler'
import { readBody, setCookie } from 'h3'
import { z } from 'zod'
import { db } from '../../../utils/db'
import { portalUsers } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '../../../utils/password'
import {
  PORTAL_COOKIE_NAME,
  PORTAL_MAX_AGE_SECONDS,
  createPortalSessionToken
} from '../../../utils/portal-auth'

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
})

export default apiHandler(async (event) => {
  const body = loginSchema.parse(await readBody(event))

  const user = await db.query.portalUsers.findFirst({
    where: eq(portalUsers.login, body.login),
    with: {
      customer: true
    }
  })

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Nieprawidłowy login lub hasło' })
  }

  if (!user.customer || user.customer.archivedAt) {
    throw createError({ statusCode: 401, statusMessage: 'Konto klienta jest nieaktywne' })
  }

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Nieprawidłowy login lub hasło' })
  }

  // Update last login timestamp
  await db.update(portalUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(portalUsers.id, user.id))
    .execute()

  setCookie(event, PORTAL_COOKIE_NAME, createPortalSessionToken({
    portalUserId: user.id,
    customerId: user.customerId,
    customerName: user.customer.fullName,
    login: user.login
  }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: PORTAL_MAX_AGE_SECONDS
  })

  return {
    success: true,
    data: {
      login: user.login,
      customerName: user.customer.fullName
    }
  }
})

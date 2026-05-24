import { readBody, setCookie } from 'h3'
import { z } from 'zod'
import {
  AUTH_COOKIE_NAME,
  AUTH_MAX_AGE_SECONDS,
  createAuthSessionToken,
  getAuthConfig,
  validateLocalLogin
} from '../../utils/auth'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const config = getAuthConfig()
  const body = loginSchema.parse(await readBody(event))

  if (!validateLocalLogin(body, config)) {
    throw createError({ statusCode: 401, statusMessage: 'Nieprawidłowy login lub hasło' })
  }

  setCookie(event, AUTH_COOKIE_NAME, createAuthSessionToken({
    username: body.username,
    secret: config.sessionSecret
  }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: AUTH_MAX_AGE_SECONDS
  })

  return {
    success: true,
    data: {
      username: body.username
    }
  }
})

import { getCookie, getRequestURL, sendRedirect } from 'h3'
import {
  AUTH_COOKIE_NAME,
  getAuthConfig,
  validateAuthSessionToken
} from '../utils/auth'

const publicPathPrefixes = [
  '/_nuxt/',
  '/__nuxt',
  '/api/auth/',
  '/api/netflow/ingest-aggregate',
  '/favicon.ico',
  '/robots.txt',
  '/portal/',
  '/api/portal/'
]

function isPublicPath(pathname: string) {
  return pathname === '/login' || publicPathPrefixes.some(prefix => pathname.startsWith(prefix))
}

export default defineEventHandler(async (event) => {
  const config = getAuthConfig()
  if (!config.enabled) return

  const pathname = getRequestURL(event).pathname
  if (isPublicPath(pathname)) return

  const session = validateAuthSessionToken(getCookie(event, AUTH_COOKIE_NAME), config.sessionSecret)
  if (session) {
    event.context.auth = session
    return
  }

  if (pathname.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Wymagana autoryzacja' })
  }

  return sendRedirect(event, '/login', 302)
})

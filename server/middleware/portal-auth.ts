import { getRequestURL, sendRedirect } from 'h3'
import { getPortalSession } from '../utils/portal-auth'

const portalPublicPaths = [
  '/portal/login',
  '/api/portal/auth/login',
  '/api/portal/auth/session'
]

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  // Only apply to portal routes
  if (!pathname.startsWith('/portal/') && !pathname.startsWith('/api/portal/')) return

  // Allow public portal paths
  if (portalPublicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) return

  // Check portal session
  const session = getPortalSession(event)
  if (session) {
    event.context.portalAuth = session
    return
  }

  // API routes return 401, pages redirect to login
  if (pathname.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Wymagane logowanie do portalu klienta' })
  }

  return sendRedirect(event, '/portal/login', 302)
})

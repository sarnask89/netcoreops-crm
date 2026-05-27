import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie } from 'h3'
import { db } from './db'
import { portalUsers } from '../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from './password'

export const PORTAL_COOKIE_NAME = 'portal_session'
export const PORTAL_MAX_AGE_SECONDS = 12 * 60 * 60

export interface PortalSession {
  customerId: string
  customerName: string
  login: string
  portalUserId: string
  issuedAt: string
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function getPortalSecret(): string {
  return process.env.NETCOREOPS_PORTAL_SESSION_SECRET
    || process.env.NETCOREOPS_AUTH_SESSION_SECRET
    || process.env.NETCOREOPS_SECRET_KEY
    || 'netcoreops-portal-session-secret'
}

export function createPortalSessionToken(input: Omit<PortalSession, 'issuedAt'> & { issuedAt?: Date }) {
  const payload = base64Url(JSON.stringify({
    customerId: input.customerId,
    customerName: input.customerName,
    login: input.login,
    portalUserId: input.portalUserId,
    issuedAt: (input.issuedAt || new Date()).toISOString()
  } satisfies PortalSession))

  return `${payload}.${sign(payload, getPortalSecret())}`
}

export function validatePortalSessionToken(
  token: string | null | undefined,
  options: { now?: Date, maxAgeSeconds?: number } = {}
): PortalSession | null {
  if (!token) return null

  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null

  const secret = getPortalSecret()
  const expected = sign(payload, secret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PortalSession
    const issuedAt = new Date(session.issuedAt)
    if (!session.customerId || !session.login || Number.isNaN(issuedAt.getTime())) return null

    const now = options.now || new Date()
    const maxAgeMs = (options.maxAgeSeconds || PORTAL_MAX_AGE_SECONDS) * 1000
    if (now.getTime() - issuedAt.getTime() > maxAgeMs) return null

    return session
  } catch {
    return null
  }
}

export function getPortalSession(event: H3Event): PortalSession | null {
  return validatePortalSessionToken(getCookie(event, PORTAL_COOKIE_NAME))
}

export function setPortalSessionCookie(event: H3Event, session: PortalSession) {
  const { issuedAt: _issuedAt, ...sessionData } = session
  setCookie(event, PORTAL_COOKIE_NAME, createPortalSessionToken(sessionData), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: PORTAL_MAX_AGE_SECONDS
  })
}

export function clearPortalSessionCookie(event: H3Event) {
  setCookie(event, PORTAL_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0
  })
}

export async function verifyPortalLogin(login: string, password: string) {
  const user = await db.query.portalUsers.findFirst({
    where: eq(portalUsers.login, login),
    with: {
      customer: true
    }
  })

  if (!user || !user.isActive) return null
  if (!user.customer || user.customer.archivedAt) return null

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  return user
}

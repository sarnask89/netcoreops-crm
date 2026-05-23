import { createHmac, timingSafeEqual } from 'node:crypto'

export const AUTH_COOKIE_NAME = 'netcoreops_session'
export const AUTH_MAX_AGE_SECONDS = 12 * 60 * 60

export interface AuthConfig {
  enabled: boolean
  username: string
  password: string
  sessionSecret: string
}

export interface AuthSession {
  username: string
  issuedAt: string
}

type AuthEnv = Record<string, string | undefined>

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function getAuthConfig(env: AuthEnv = process.env): AuthConfig {
  return {
    enabled: env.NETCOREOPS_AUTH_DISABLED !== 'true',
    username: env.NETCOREOPS_AUTH_USERNAME || env.NETCOREOPS_OPERATOR_USERNAME || 'admin',
    password: env.NETCOREOPS_AUTH_PASSWORD || 'admin',
    sessionSecret: env.NETCOREOPS_AUTH_SESSION_SECRET || env.NETCOREOPS_SECRET_KEY || 'netcoreops-local-session-secret'
  }
}

export function validateLocalLogin(input: { username?: string, password?: string }, config = getAuthConfig()) {
  return input.username === config.username && input.password === config.password
}

export function createAuthSessionToken(input: { username: string, secret: string, issuedAt?: Date }) {
  const payload = base64Url(JSON.stringify({
    username: input.username,
    issuedAt: (input.issuedAt || new Date()).toISOString()
  } satisfies AuthSession))

  return `${payload}.${sign(payload, input.secret)}`
}

export function validateAuthSessionToken(
  token: string | null | undefined,
  secret: string,
  options: { now?: Date, maxAgeSeconds?: number } = {}
): AuthSession | null {
  if (!token) return null

  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null

  const expected = sign(payload, secret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthSession
    const issuedAt = new Date(session.issuedAt)
    if (!session.username || Number.isNaN(issuedAt.getTime())) return null

    const now = options.now || new Date()
    const maxAgeMs = (options.maxAgeSeconds || AUTH_MAX_AGE_SECONDS) * 1000
    if (now.getTime() - issuedAt.getTime() > maxAgeMs) return null

    return session
  } catch {
    return null
  }
}

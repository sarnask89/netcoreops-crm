import { describe, expect, it } from 'vitest'
import {
  createAuthSessionToken,
  getAuthConfig,
  validateAuthSessionToken,
  validateLocalLogin
} from './auth'

describe('local auth', () => {
  it('accepts configured local credentials', () => {
    const config = getAuthConfig({
      NETCOREOPS_AUTH_USERNAME: 'admin',
      NETCOREOPS_AUTH_PASSWORD: 'secret',
      NETCOREOPS_AUTH_SESSION_SECRET: 'session-secret'
    })

    expect(validateLocalLogin({ username: 'admin', password: 'secret' }, config)).toBe(true)
    expect(validateLocalLogin({ username: 'admin', password: 'bad' }, config)).toBe(false)
  })

  it('validates signed session tokens and rejects tampering', () => {
    const token = createAuthSessionToken({
      username: 'admin',
      secret: 'session-secret',
      issuedAt: new Date('2026-05-23T05:00:00.000Z')
    })

    expect(validateAuthSessionToken(token, 'session-secret', {
      now: new Date('2026-05-23T05:01:00.000Z')
    })?.username).toBe('admin')
    expect(validateAuthSessionToken(`${token}x`, 'session-secret')).toBeNull()
  })
})

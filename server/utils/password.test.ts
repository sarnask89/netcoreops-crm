import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('verifies matching passwords and rejects wrong passwords', async () => {
    const hash = await hashPassword('correct horse battery staple')

    expect(hash).toMatch(/^scrypt\$/)
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false)
  })
})

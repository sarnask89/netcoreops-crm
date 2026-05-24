import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const keyLength = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const hash = await scryptAsync(password, salt, keyLength) as Buffer
  return `scrypt$${salt}$${hash.toString('base64url')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !expectedHash) return false

  const expected = Buffer.from(expectedHash, 'base64url')
  const actual = await scryptAsync(password, salt, expected.length) as Buffer
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

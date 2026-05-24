import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const ENCRYPTION_PREFIX = 'v1'
const KEY_SALT = 'netcoreops-access-profile'

function getSecretKey() {
  const source = process.env.NETCOREOPS_SECRET_KEY || 'netcoreops-local-development-key'
  return scryptSync(source, KEY_SALT, 32)
}

export function encryptSecret(value?: string | null) {
  if (!value) return value ?? null
  if (value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getSecretKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url')
  ].join(':')
}

export function decryptSecret(value?: string | null) {
  if (!value) return value ?? null
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value

  const [, ivValue, tagValue, encryptedValue] = value.split(':')
  if (!ivValue || !tagValue || !encryptedValue) return null

  const decipher = createDecipheriv('aes-256-gcm', getSecretKey(), Buffer.from(ivValue, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final()
  ]).toString('utf8')
}

export function encryptAccessProfileSecrets<T extends {
  passwordEncrypted?: string | null
  snmpCommunityEncrypted?: string | null
  apiTokenEncrypted?: string | null
  sshKeyEncrypted?: string | null
}>(profile: T): T {
  return {
    ...profile,
    passwordEncrypted: encryptSecret(profile.passwordEncrypted),
    snmpCommunityEncrypted: encryptSecret(profile.snmpCommunityEncrypted),
    apiTokenEncrypted: encryptSecret(profile.apiTokenEncrypted),
    sshKeyEncrypted: encryptSecret(profile.sshKeyEncrypted)
  }
}

export function decryptAccessProfileSecrets<T extends {
  passwordEncrypted?: string | null
  snmpCommunityEncrypted?: string | null
  apiTokenEncrypted?: string | null
  sshKeyEncrypted?: string | null
}>(profile: T): T {
  return {
    ...profile,
    passwordEncrypted: decryptSecret(profile.passwordEncrypted),
    snmpCommunityEncrypted: decryptSecret(profile.snmpCommunityEncrypted),
    apiTokenEncrypted: decryptSecret(profile.apiTokenEncrypted),
    sshKeyEncrypted: decryptSecret(profile.sshKeyEncrypted)
  }
}

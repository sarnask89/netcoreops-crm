import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { accessProfiles } from '../../../db/schema'
import { updateAccessProfileSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { encryptAccessProfileSecrets } from '../../../utils/secrets'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id profilu' })

  const payload = updateAccessProfileSchema.parse(await readBody(event))
  const [profile] = await db.update(accessProfiles)
    .set(definedEntries(encryptAccessProfileSecrets(payload)))
    .where(eq(accessProfiles.id, id))
    .returning()

  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Profil nie istnieje' })
  return { success: true, data: profile }
})

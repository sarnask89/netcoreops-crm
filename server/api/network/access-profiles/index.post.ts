import { readBody } from 'h3'
import { accessProfiles } from '../../../db/schema'
import { createAccessProfileSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { encryptAccessProfileSecrets } from '../../../utils/secrets'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createAccessProfileSchema.parse(body)
  const [profile] = await db.insert(accessProfiles).values(encryptAccessProfileSecrets(payload)).returning()

  return { success: true, data: profile }
})

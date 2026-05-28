import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { documents } from '../../../db/schema'
import { updateDocumentSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id dokumentu' })

  const payload = updateDocumentSchema.parse(await readBody(event))

  const [doc] = await db.update(documents)
    .set(definedEntries(payload as Record<string, unknown>))
    .where(eq(documents.id, id))
    .returning()

  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Dokument nie istnieje' })
  return { success: true, data: doc }
})

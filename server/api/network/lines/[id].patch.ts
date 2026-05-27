import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { networkLines } from '../../../db/schema'
import { updateLineSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { resolveMediumTypeId } from '../../../utils/dictionaries'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id linii' })

  const payload = updateLineSchema.parse(await readBody(event))
  const { mediumCode, nodeStartId, nodeEndId, ...linePayload } = payload
  const updateData: Record<string, unknown> = definedEntries({
    ...linePayload,
    nodeStartId,
    nodeEndId
  })

  if (mediumCode !== undefined) {
    updateData.mediumTypeId = await resolveMediumTypeId(mediumCode)
  }

  const [line] = await db.update(networkLines)
    .set(updateData)
    .where(eq(networkLines.id, id))
    .returning()

  if (!line) throw createError({ statusCode: 404, statusMessage: 'Linia nie istnieje' })
  return { success: true, data: line }
})

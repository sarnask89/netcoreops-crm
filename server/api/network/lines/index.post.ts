import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { networkLines } from '../../../db/schema'
import { createLineSchema } from '../../../utils/api-validation'
import { resolveMediumTypeId } from '../../../utils/dictionaries'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createLineSchema.parse(body)
  const mediumTypeId = await resolveMediumTypeId(payload.mediumCode)
  const [line] = await db.insert(networkLines).values({
    inventoryId: payload.inventoryId,
    nodeStartId: payload.nodeStartId,
    nodeEndId: payload.nodeEndId,
    mediumTypeId,
    fiberCount: payload.fiberCount,
    lengthMeters: payload.lengthMeters,
    status: payload.status
  }).returning()

  return { success: true, data: line }
})

import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { networkNodes } from '../../../db/schema'
import { updateNodeSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { resolveAddressIds, resolveMediumTypeId } from '../../../utils/dictionaries'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id węzła' })

  const payload = updateNodeSchema.parse(await readBody(event))
  const { address, mediumCode, ...nodePayload } = payload
  const updateData: Record<string, unknown> = definedEntries(nodePayload)

  if (mediumCode !== undefined) {
    updateData.mediumTypeId = await resolveMediumTypeId(mediumCode)
  }

  if (address !== undefined) {
    const addressIds = await resolveAddressIds(address)
    updateData.terytAreaId = addressIds.terytAreaId
    updateData.simcLocalityId = addressIds.simcLocalityId
    updateData.streetId = addressIds.streetId
    updateData.buildingNumber = address?.buildingNumber || null
  }

  const [node] = await db.update(networkNodes)
    .set(updateData)
    .where(eq(networkNodes.id, id))
    .returning()

  if (!node) throw createError({ statusCode: 404, statusMessage: 'Węzeł nie istnieje' })
  return { success: true, data: node }
})

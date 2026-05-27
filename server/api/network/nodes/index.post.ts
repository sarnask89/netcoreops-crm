import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { networkNodes } from '../../../db/schema'
import { createNodeSchema } from '../../../utils/api-validation'
import { resolveAddressIds, resolveMediumTypeId } from '../../../utils/dictionaries'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createNodeSchema.parse(body)
  const addressIds = await resolveAddressIds(payload.address)
  const mediumTypeId = await resolveMediumTypeId(payload.mediumCode)
  const [node] = await db.insert(networkNodes).values({
    inventoryId: payload.inventoryId,
    name: payload.name,
    nodeType: payload.nodeType,
    mediumTypeId,
    terytAreaId: addressIds.terytAreaId,
    simcLocalityId: addressIds.simcLocalityId,
    streetId: addressIds.streetId,
    buildingNumber: payload.address?.buildingNumber || null,
    latitude: payload.latitude,
    longitude: payload.longitude,
    status: payload.status
  }).returning()

  return { success: true, data: node }
})

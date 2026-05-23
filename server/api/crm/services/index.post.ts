import { readBody } from 'h3'
import { customerServices } from '../../../db/schema'
import { createServiceSchema } from '../../../utils/api-validation'
import { resolveAddressIds } from '../../../utils/dictionaries'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const payload = createServiceSchema.parse(await readBody(event))
  const addressIds = await resolveAddressIds(payload.address)

  const [service] = await db.insert(customerServices).values({
    customerId: payload.customerId,
    profileId: payload.profileId,
    equipmentId: payload.equipmentId || null,
    serviceTerytAreaId: addressIds.terytAreaId,
    serviceSimcLocalityId: addressIds.simcLocalityId,
    serviceStreetId: addressIds.streetId,
    serviceBuildingNumber: payload.address.buildingNumber || null,
    serviceApartmentNumber: payload.address.apartmentNumber || null,
    activationDate: payload.status === 'ACTIVE' ? new Date() : null,
    status: payload.status
  }).returning()

  return { success: true, data: service }
})

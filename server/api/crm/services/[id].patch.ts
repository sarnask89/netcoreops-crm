import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customerServices } from '../../../db/schema'
import { updateServiceSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { resolveAddressIds } from '../../../utils/dictionaries'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id uslugi' })

  const payload = updateServiceSchema.parse(await readBody(event))
  const updateData: Record<string, unknown> = {}
  if (payload.customerId !== undefined) updateData.customerId = payload.customerId
  if (payload.profileId !== undefined) updateData.profileId = payload.profileId
  if (payload.equipmentId !== undefined) updateData.equipmentId = payload.equipmentId || null
  if (payload.status !== undefined) {
    updateData.status = payload.status
    if (payload.status === 'ACTIVE') updateData.activationDate = new Date()
  }
  if (payload.address !== undefined) {
    const addressIds = await resolveAddressIds(payload.address)
    updateData.serviceTerytAreaId = addressIds.terytAreaId
    updateData.serviceSimcLocalityId = addressIds.simcLocalityId
    updateData.serviceStreetId = addressIds.streetId
    updateData.serviceBuildingNumber = payload.address.buildingNumber || null
    updateData.serviceApartmentNumber = payload.address.apartmentNumber || null
  }

  const [service] = await db.update(customerServices)
    .set(updateData)
    .where(eq(customerServices.id, id))
    .returning()

  if (!service) throw createError({ statusCode: 404, statusMessage: 'Usluga nie istnieje' })
  return { success: true, data: service }
})

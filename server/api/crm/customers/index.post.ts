import { readBody } from 'h3'
import { customers } from '../../../db/schema'
import { createCustomerSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { resolveAddressIds } from '../../../utils/dictionaries'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createCustomerSchema.parse(body)
  const { billingAddressRef, ...customerPayload } = payload
  const billingAddressIds = await resolveAddressIds(billingAddressRef)
  const fullName = payload.customerType === 'BUSINESS'
    ? payload.companyName || payload.fullName
    : [payload.firstName, payload.lastName].filter(Boolean).join(' ')

  const [customer] = await db.insert(customers).values({
    ...customerPayload,
    billingTerytAreaId: billingAddressIds.terytAreaId,
    billingSimcLocalityId: billingAddressIds.simcLocalityId,
    billingStreetId: billingAddressIds.streetId,
    billingBuildingNumber: billingAddressRef?.buildingNumber || null,
    billingApartmentNumber: billingAddressRef?.apartmentNumber || null,
    fullName: fullName || payload.fullName || 'Bez nazwy'
  }).returning()

  return { success: true, data: customer }
})

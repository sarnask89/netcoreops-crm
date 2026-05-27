import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customers } from '../../../db/schema'
import { updateCustomerSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'
import { resolveAddressIds } from '../../../utils/dictionaries'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id klienta' })

  const payload = updateCustomerSchema.parse(await readBody(event))
  const { billingAddressRef, ...customerPayload } = payload
  const updateData: Record<string, unknown> = definedEntries(customerPayload)

  if (billingAddressRef !== undefined) {
    const billingAddressIds = await resolveAddressIds(billingAddressRef)
    updateData.billingTerytAreaId = billingAddressIds.terytAreaId
    updateData.billingSimcLocalityId = billingAddressIds.simcLocalityId
    updateData.billingStreetId = billingAddressIds.streetId
    updateData.billingBuildingNumber = billingAddressRef?.buildingNumber || null
    updateData.billingApartmentNumber = billingAddressRef?.apartmentNumber || null
  }

  const fullName = payload.customerType === 'BUSINESS'
    ? payload.companyName || payload.fullName
    : [payload.firstName, payload.lastName].filter(Boolean).join(' ')
  if (fullName) updateData.fullName = fullName

  const [customer] = await db.update(customers)
    .set(updateData)
    .where(eq(customers.id, id))
    .returning()

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Klient nie istnieje' })
  return { success: true, data: customer }
})

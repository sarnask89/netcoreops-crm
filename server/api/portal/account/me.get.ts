import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })
  }

  const customer = await db.query.customers.findFirst({
    where: (customers, { eq }) => eq(customers.id, session.customerId),
    with: {
      services: {
        with: {
          profile: true,
          serviceSimcLocality: true,
          serviceStreet: true
        }
      },
      subscriptions: {
        with: {
          tariff: true
        }
      },
      customerDevices: {
        with: {
          equipment: true,
          onuEquipment: true
        }
      }
    }
  })

  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono klienta' })
  }

  return {
    success: true,
    data: {
      id: customer.id,
      fullName: customer.fullName,
      customerType: customer.customerType,
      contactEmail: customer.contactEmail,
      contactPhone: customer.contactPhone,
      services: customer.services.map(s => ({
        id: s.id,
        status: s.status,
        activationDate: s.activationDate,
        profileName: s.profile?.name || null,
        downloadMbps: s.profile?.downloadSpeedMbps || null,
        uploadMbps: s.profile?.uploadSpeedMbps || null,
        address: [
          s.serviceStreet?.name,
          s.serviceBuildingNumber,
          s.serviceApartmentNumber,
          s.serviceSimcLocality?.name
        ].filter(Boolean).join(', ')
      })),
      subscriptions: customer.subscriptions.map(s => ({
        id: s.id,
        status: s.status,
        tariffName: s.tariff?.name || null,
        price: s.priceOverrideNet || s.tariff?.defaultNetPrice || null,
        billingPeriod: s.billingPeriod,
        activationFee: s.activationFee
      })),
      devices: customer.customerDevices.map(d => ({
        id: d.id,
        hostname: d.hostname,
        equipmentHostname: d.equipment?.hostname || null,
        onuHostname: d.onuEquipment?.hostname || null
      }))
    }
  }
})

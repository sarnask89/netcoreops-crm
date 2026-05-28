import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

function formatAddress(record: {
  billingStreet?: { streetType?: string | null, name?: string | null } | null
  billingSimcLocality?: { name?: string | null } | null
  billingBuildingNumber?: string | null
  billingApartmentNumber?: string | null
  serviceStreet?: { streetType?: string | null, name?: string | null } | null
  serviceSimcLocality?: { name?: string | null } | null
  serviceBuildingNumber?: string | null
  serviceApartmentNumber?: string | null
}) {
  const street = record.serviceStreet || record.billingStreet
  const locality = record.serviceSimcLocality || record.billingSimcLocality
  const building = record.serviceBuildingNumber || record.billingBuildingNumber
  const apartmentNumber = record.serviceApartmentNumber || record.billingApartmentNumber
  const apartment = apartmentNumber ? `/${apartmentNumber}` : ''

  return [
    street ? `${street.streetType || 'ul.'} ${street.name}` : '',
    building ? `${building}${apartment}` : '',
    locality?.name || ''
  ].filter(Boolean).join(', ')
}

export default apiHandler(async () => {
  const customers = await db.query.customers.findMany({
    columns: {
      id: true,
      fullName: true,
      customerType: true,
      contactPhone: true,
      contactEmail: true,
      billingBuildingNumber: true,
      billingApartmentNumber: true
    },
    with: {
      billingStreet: true,
      billingSimcLocality: true,
      customerDevices: {
        with: {
          equipment: {
            with: { node: true }
          },
          onuEquipment: {
            with: { node: true }
          },
          subscriptions: {
            with: { tariff: true }
          }
        }
      },
      services: {
        with: {
          serviceStreet: true,
          serviceSimcLocality: true,
          equipment: {
            with: { node: true }
          }
        }
      }
    },
    orderBy: (table, { asc }) => [asc(table.fullName)]
  })

  const locations = customers.flatMap((customer) => {
    const billingAddress = formatAddress(customer)
    const serviceAddresses = customer.services
      .map(service => formatAddress(service))
      .filter(Boolean)
    const uniqueAddresses = [...new Set([billingAddress, ...serviceAddresses].filter(Boolean))]

    return uniqueAddresses.map((address) => {
      const relatedNodes = new Map<string, { id: string, name: string, nodeType: string, status: string }>()
      for (const device of customer.customerDevices) {
        const nodes = [device.equipment?.node, device.onuEquipment?.node]
        for (const node of nodes) {
          if (!node) continue
          relatedNodes.set(node.id, {
            id: node.id,
            name: node.name,
            nodeType: node.nodeType,
            status: node.status
          })
        }
      }
      for (const service of customer.services) {
        const node = service.equipment?.node
        if (node) {
          relatedNodes.set(node.id, {
            id: node.id,
            name: node.name,
            nodeType: node.nodeType,
            status: node.status
          })
        }
      }

      return {
        customerId: customer.id,
        customerName: customer.fullName,
        customerType: customer.customerType,
        contactPhone: customer.contactPhone,
        contactEmail: customer.contactEmail,
        address,
        deviceCount: customer.customerDevices.length,
        activeSubscriptionCount: customer.customerDevices.reduce((count, device) => {
          return count + device.subscriptions.filter(subscription => subscription.status === 'ACTIVE').length
        }, 0),
        nodes: [...relatedNodes.values()]
      }
    })
  })

  return { success: true, data: locations }
})

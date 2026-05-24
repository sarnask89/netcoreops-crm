import { db } from '../utils/db'

export default defineEventHandler(async () => {
  const customers = await db.query.customers.findMany({
    with: {
      services: {
        with: {
          profile: true,
          serviceSimcLocality: true,
          serviceStreet: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return customers.map(customer => ({
    id: customer.id,
    name: customer.fullName,
    email: customer.contactEmail || '',
    status: customer.services.some(service => service.status === 'ACTIVE') ? 'subscribed' : 'unsubscribed',
    location: customer.services[0]
      ? [
          customer.services[0].serviceStreet?.name,
          customer.services[0].serviceSimcLocality?.name
        ].filter(Boolean).join(', ')
      : ''
  }))
})

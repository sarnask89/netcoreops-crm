import { apiHandler } from '../../../utils/api-handler'
import { isNull } from 'drizzle-orm'
import { getQuery } from 'h3'
import { customers } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const includeArchived = query.includeArchived === 'true'
  const customerRows = await db.query.customers.findMany({
    where: includeArchived ? undefined : isNull(customers.archivedAt),
    with: {
      billingTerytArea: true,
      billingSimcLocality: true,
      billingStreet: true,
      services: {
        with: {
          profile: true,
          equipment: {
            with: {
              node: true
            }
          },
          serviceTerytArea: true,
          serviceSimcLocality: true,
          serviceStreet: true
        }
      },
      customerDevices: {
        with: {
          equipment: true,
          onuEquipment: true,
          subscriptions: {
            with: {
              tariff: true
            }
          }
        }
      },
      portalUser: {
        columns: {
          id: true,
          login: true,
          isActive: true,
          lastLoginAt: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: customerRows }
})

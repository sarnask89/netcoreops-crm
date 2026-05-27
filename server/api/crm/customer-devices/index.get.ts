import { apiHandler } from '../../../utils/api-handler'
import { isNull } from 'drizzle-orm'
import { getQuery } from 'h3'
import { customerDevices } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const includeArchived = query.includeArchived === 'true'
  const devices = await db.query.customerDevices.findMany({
    where: includeArchived ? undefined : isNull(customerDevices.archivedAt),
    with: {
      customer: true,
      equipment: true,
      onuEquipment: true,
      subscriptions: {
        with: {
          tariff: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: devices }
})

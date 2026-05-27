import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getQuery } from 'h3'
import { networkEquipment } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const role = typeof query.role === 'string' ? query.role : undefined

  const equipment = await db.query.networkEquipment.findMany({
    where: role ? eq(networkEquipment.equipmentRole, role) : undefined,
    with: {
      model: {
        with: {
          type: true
        }
      },
      node: true,
      accessProfile: true,
      managementDriver: true,
      parentEquipment: true,
      childEquipment: true,
      customerDevices: true,
      service: true,
      profileBindings: {
        with: {
          profile: true
        }
      },
      automationScripts: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })

  return { success: true, data: equipment }
})

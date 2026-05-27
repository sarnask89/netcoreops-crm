import { apiHandler } from '../../utils/api-handler'
import { db } from '../../utils/db'

export default apiHandler(async () => {
  const equipment = await db.query.networkEquipment.findMany({
    columns: {
      id: true,
      inventoryId: true,
      hostname: true,
      managementIp: true,
      managementProtocol: true
    },
    with: {
      managementDriver: {
        columns: {
          code: true,
          label: true
        }
      }
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })

  return {
    success: true,
    data: {
      equipment
    }
  }
})

import { apiHandler } from '../../../../utils/api-handler'
import { getQuery, getRouterParam } from 'h3'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit || 200), 1000)
  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const leases = await driver.getLeases()

  return {
    success: true,
    data: {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      driver: driverCode,
      total: leases.length,
      leases: leases.slice(0, limit)
    }
  }
})

import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam } from 'h3'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const commandTree = await driver.getCommandTree()

  const data = withDiagnosticPresentation('Command tree', {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: equipment.inventoryId,
    commandTree
  })

  return {
    success: commandTree.status === 'ok',
    data
  }
})

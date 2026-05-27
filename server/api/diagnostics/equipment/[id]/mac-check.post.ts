import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

const bodySchema = z.object({
  macAddress: z.string().min(1).max(17)
})

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const { macAddress } = bodySchema.parse(await readBody(event))
  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const checks = [
    await driver.getBridgeHost(macAddress),
    await driver.getSwitchFdb(macAddress)
  ]

  const data = withDiagnosticPresentation('MAC lookup', {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: { macAddress },
    checks
  })

  return {
    success: checks.some(check => check.status === 'ok'),
    data
  }
})

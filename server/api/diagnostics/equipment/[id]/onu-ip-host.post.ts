import { getRouterParam, readBody } from 'h3'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const body = await readBody<{ oltPort?: string, onuId?: string }>(event)
  if (!body.oltPort || !body.onuId) {
    throw createError({ statusCode: 400, statusMessage: 'Podaj port OLT i id ONU' })
  }

  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const ipHosts = await driver.getOnuIpHosts(body.oltPort, body.onuId)

  const data = withDiagnosticPresentation('ONU IP-host', {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: `${body.oltPort}/${body.onuId}`,
    checks: [{
      name: 'onu-ip-host',
      status: 'ok' as const,
      data: ipHosts
    }]
  })

  return {
    success: true,
    data
  }
})

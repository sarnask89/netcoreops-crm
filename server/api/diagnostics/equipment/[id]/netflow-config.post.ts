import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { diagnosticRuns } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'
import { parseNetflowCollector } from '../../../../network-drivers/netflow'

const bodySchema = z.object({
  collector: z.string().optional()
})

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const body = bodySchema.parse(await readBody(event).catch(() => ({})))
  const collector = body.collector || process.env.NETCOREOPS_NETFLOW_COLLECTOR || '10.0.222.226:2055'
  parseNetflowCollector(collector)

  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const result = await driver.configureNetflow({ collector, version: 'ipfix' })
  const success = result.status === 'ok' || result.status === 'warning'

  await db.insert(diagnosticRuns).values({
    equipmentId: equipment.id,
    driverCode,
    runType: 'netflow-config',
    target: collector,
    success,
    result
  })

  if (result.status === 'unsupported') {
    throw createError({ statusCode: 400, statusMessage: result.message || 'Driver nie wspiera NetFlow' })
  }
  if (result.status === 'error') {
    throw createError({ statusCode: 500, statusMessage: result.message || 'Konfiguracja NetFlow nie powiodła się' })
  }

  return {
    success,
    data: {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      driver: driverCode,
      result
    }
  }
})

import { apiHandler } from '../../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { runDasanMacMapImport } from '../../../../../ftth/dasan-import-runner'
import { importModeSchema } from '../../../../../utils/api-validation'
import { getDriverForEquipment } from '../../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event)
  const { mode, activeOnly, limit, rangeFrom, rangeTo } = importModeSchema.parse(body || {})
  const { driver, driverCode } = await getDriverForEquipment(equipmentId)

  return {
    success: true,
    data: await runDasanMacMapImport({ equipmentId, mode, activeOnly, limit, rangeFrom, rangeTo, driver, driverCode })
  }
})

import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { importModeSchema } from '../../../../utils/api-validation'
import { recordImportRun } from '../../../../utils/import-actions'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event)
  const { mode } = importModeSchema.parse(body || {})
  const effectiveMode = mode === 'dryRun' ? 'preview' : mode
  const { driverCode } = await getDriverForEquipment(equipmentId)
  const summary = {
    mode: effectiveMode,
    actions: [{
      action: 'skip',
      entity: 'deviceConfig',
      key: equipmentId,
      label: 'Synchronizacja konfiguracji MikroTik',
      reason: 'Interfejsy/pule/DHCP wymagają tabel IPAM w kolejnym kroku',
      data: {}
    }]
  }

  await recordImportRun(equipmentId, driverCode, 'mikrotik-config', effectiveMode, summary)

  return { success: true, data: summary }
})

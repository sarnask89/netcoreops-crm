import { getRouterParam, readBody } from 'h3'
import { syncDasanOnusToFtth } from '../../../../ftth/import-service'
import { importModeSchema } from '../../../../utils/api-validation'
import { compactImportSummary, recordImportRun } from '../../../../utils/import-actions'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event).catch(() => ({}))
  const { mode, activeOnly, limit, rangeFrom, rangeTo } = importModeSchema.parse(body || {})
  const effectiveMode = mode === 'dryRun' ? 'preview' : mode
  const { driver, driverCode } = await getDriverForEquipment(equipmentId)
  const onus = await driver.getOnus({ activeOnly, limit, rangeFrom, rangeTo })
  const actions = await syncDasanOnusToFtth(equipmentId, onus, effectiveMode)
  const compactSummary = compactImportSummary({ mode: effectiveMode, onus: onus.length, actions }) as Record<string, unknown>
  const summary = {
    ...compactSummary,
    progress: {
      activeOnly,
      totalKnownOnus: onus.length,
      selectedOnus: onus.length,
      processedOnus: onus.length,
      rangeFrom,
      rangeTo,
      completed: true,
      currentOnu: null
    }
  }

  await recordImportRun(equipmentId, driverCode, 'dasan-onus', effectiveMode, summary)

  return { success: true, data: summary }
})

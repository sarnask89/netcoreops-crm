import { getRouterParam, readBody } from 'h3'
import { importModeSchema } from '../../../../utils/api-validation'
import { buildMikrotikLeaseActions, compactImportSummary, recordImportRun } from '../../../../utils/import-actions'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event).catch(() => ({}))
  const { mode } = importModeSchema.parse(body || {})
  const effectiveMode = mode === 'dryRun' ? 'preview' : mode
  const selectedNetworks = Array.isArray(body?.selectedNetworks)
    ? body.selectedNetworks.filter((network: unknown) => typeof network === 'string' && network.trim())
    : []
  const { driver, driverCode } = await getDriverForEquipment(equipmentId)
  const leases = await driver.getLeases()
  const actions = await buildMikrotikLeaseActions(equipmentId, leases, effectiveMode, selectedNetworks)
  const summary = compactImportSummary({ leases: leases.length, actions, mode: effectiveMode })

  await recordImportRun(equipmentId, driverCode, 'mikrotik-leases', effectiveMode, summary)

  return { success: true, data: summary }
})

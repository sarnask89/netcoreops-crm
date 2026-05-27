import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { ipNetworks } from '../../../../db/schema'
import { importModeSchema } from '../../../../utils/api-validation'
import { recordImportRun } from '../../../../utils/import-actions'
import { db } from '../../../../utils/db'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event).catch(() => ({}))
  const { mode } = importModeSchema.parse(body || {})
  const effectiveMode = mode === 'dryRun' ? 'preview' : mode
  const { driver, driverCode } = await getDriverForEquipment(equipmentId)
  const networks = await driver.getNetworks()
  const existingNetworks = await db.query.ipNetworks.findMany()
  const existingCidrs = new Set(existingNetworks.map(network => network.cidr))

  if (effectiveMode === 'apply') {
    for (const network of networks) {
      const comment = network.comment?.trim()
      const name = comment ? `DHCP ${network.cidr} - ${comment}` : `DHCP ${network.cidr}`

      await db.insert(ipNetworks).values({
        name,
        cidr: network.cidr,
        gateway: network.gateway || null,
        ownerEquipmentId: equipmentId,
        status: 'ACTIVE'
      }).onConflictDoUpdate({
        target: ipNetworks.cidr,
        set: {
          name,
          gateway: network.gateway || null,
          ownerEquipmentId: equipmentId,
          status: 'ACTIVE'
        }
      })
    }
  }

  const summary = {
    mode: effectiveMode,
    networks,
    actions: networks.map(network => ({
      action: effectiveMode === 'apply' ? (existingCidrs.has(network.cidr) ? 'update' : 'create') : 'link',
      entity: 'network',
      key: network.cidr,
      label: network.comment || network.cidr,
      data: network,
      reason: effectiveMode === 'apply'
        ? 'Sieć DHCP zapisana w ip_networks'
        : 'Podgląd importu sieci DHCP z MikroTik'
    }))
  }

  await recordImportRun(equipmentId, driverCode, 'mikrotik-networks', effectiveMode, summary)

  return { success: true, data: summary }
})

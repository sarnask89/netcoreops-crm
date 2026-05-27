/**
 * POST /api/diagnostics/equipment/:id/snmp-poll
 *
 * Poll SNMP queues, interfaces, and system resources from a MikroTik device.
 * Stores the full result in diagnostic_runs for dashboard charting.
 */
import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam } from 'h3'
import { diagnosticRuns } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { loadManagedEquipment } from '../../../../utils/network-driver-context'
import { decryptAccessProfileSecrets } from '../../../../utils/secrets'
import { pollMikrotikSnmp } from '../../../../snmp/poller'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const equipment = await loadManagedEquipment(id)
  if (!equipment) throw createError({ statusCode: 404, statusMessage: 'Urządzenie nie istnieje' })

  // Resolve management IP
  const managementIp = equipment.managementIp
  if (!managementIp) throw createError({ statusCode: 400, statusMessage: 'Urządzenie nie ma adresu IP' })

  // Decrypt SNMP community string from the access profile
  const profile = equipment.accessProfile
    ? decryptAccessProfileSecrets(equipment.accessProfile)
    : null
  const community = profile?.snmpCommunityEncrypted
  if (!community) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Profil dostępu nie zawiera ustawionej wspólnoty SNMP'
    })
  }

  // Poll
  const result = await pollMikrotikSnmp(managementIp, community, {
    port: equipment.managementPort ?? 161
  })

  // Persist
  const driverCode = equipment.managementDriver?.code || 'mikrotik_v7'
  await db.insert(diagnosticRuns).values({
    equipmentId: equipment.id,
    driverCode,
    runType: 'snmp-poll',
    success: result.success,
    result
  })

  return {
    success: result.success,
    data: {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      driver: driverCode,
      queueCount: result.queues.length,
      interfaceCount: result.interfaces.length,
      system: {
        cpuLoad: result.system.cpuLoad,
        temperature: result.system.temperature,
        boardName: result.system.boardName,
        version: result.system.version
      },
      error: result.error ?? null
    }
  }
})

import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const ponPorts = await db.query.ftthPonPorts.findMany({
    with: {
      olt: {
        with: {
          equipment: {
            with: {
              node: true,
              managementDriver: true
            }
          }
        }
      },
      onus: true
    },
    orderBy: (table, { asc }) => [asc(table.portCode)]
  })

  return {
    success: true,
    data: ponPorts.map(port => ({
      ...port,
      oltInventoryId: port.olt.equipment.inventoryId,
      oltManagementIp: port.olt.equipment.managementIp,
      nodeName: port.olt.equipment.node?.name || null,
      driverCode: port.olt.equipment.managementDriver?.code || null,
      onuCount: port.onus.length,
      activeOnuCount: port.onus.filter(onu => onu.status.toLowerCase() === 'active').length,
      transparentCandidateCount: port.onus.filter(onu => onu.transparentCandidate).length
    }))
  }
})

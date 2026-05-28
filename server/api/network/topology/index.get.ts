import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

function formatAddress(record: {
  street?: { streetType?: string | null, name?: string | null } | null
  simcLocality?: { name?: string | null } | null
  buildingNumber?: string | null
}) {
  return [
    record.street ? `${record.street.streetType || 'ul.'} ${record.street.name}` : '',
    record.buildingNumber || '',
    record.simcLocality?.name || ''
  ].filter(Boolean).join(', ')
}

export default apiHandler(async () => {
  const nodes = await db.query.networkNodes.findMany({
    columns: {
      id: true,
      inventoryId: true,
      name: true,
      nodeType: true,
      status: true,
      latitude: true,
      longitude: true,
      buildingNumber: true
    },
    with: {
      street: true,
      simcLocality: true
    }
  })

  const lines = await db.query.networkLines.findMany({
    columns: {
      id: true,
      inventoryId: true,
      nodeStartId: true,
      nodeEndId: true,
      status: true,
      lengthMeters: true,
      fiberCount: true
    }
  })

  const equipmentList = await db.query.networkEquipment.findMany({
    columns: {
      id: true,
      inventoryId: true,
      nodeId: true,
      equipmentRole: true,
      isOnline: true,
      status: true
    },
    with: {
      customerDevices: {
        columns: { id: true, status: true }
      },
      onuCustomerDevices: {
        columns: { id: true, status: true }
      }
    }
  })

  const equipmentByNode = new Map<string, typeof equipmentList>()
  for (const eq of equipmentList) {
    if (eq.nodeId) {
      const arr = equipmentByNode.get(eq.nodeId) ?? []
      arr.push(eq)
      equipmentByNode.set(eq.nodeId, arr)
    }
  }

  const graphNodes = nodes.map((n) => {
    const nodeEquip = equipmentByNode.get(n.id) ?? []
    const onlineCount = nodeEquip.filter(e => e.isOnline).length
    const customerDeviceIds = new Set<string>()
    for (const equipment of nodeEquip) {
      for (const device of equipment.customerDevices) customerDeviceIds.add(device.id)
      for (const device of equipment.onuCustomerDevices) customerDeviceIds.add(device.id)
    }

    return {
      id: n.id,
      label: n.name,
      inventoryId: n.inventoryId,
      type: n.nodeType,
      status: n.status,
      latitude: n.latitude,
      longitude: n.longitude,
      address: formatAddress(n) || null,
      equipmentCount: nodeEquip.length,
      onlineCount,
      customerDeviceCount: customerDeviceIds.size,
      equipmentRoles: [...new Set(nodeEquip.map(e => e.equipmentRole))]
    }
  })

  const edgeStatusOrder = ['ACTIVE', 'DEGRADED', 'MAINTENANCE', 'PLANNED', 'DECOMMISSIONED']
  const linesWithStatus = lines.filter(l => l.nodeStartId && l.nodeEndId)
  const graphEdges = linesWithStatus.map(l => ({
    id: l.id,
    from: l.nodeStartId!,
    to: l.nodeEndId!,
    label: l.inventoryId,
    status: l.status,
    lengthMeters: l.lengthMeters,
    fiberCount: l.fiberCount,
    statusOrder: edgeStatusOrder.indexOf(l.status) >= 0 ? edgeStatusOrder.indexOf(l.status) : 99
  }))

  return { success: true, data: { nodes: graphNodes, edges: graphEdges } }
})

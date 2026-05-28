import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { networkNodes, networkEquipment } from '../../../db/schema'

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

export default apiHandler(async (event) => {
  const nodeId = getRouterParam(event, 'id')
  if (!nodeId) throw createError({ statusCode: 400, statusMessage: 'Brak id węzła' })

  const node = await db.query.networkNodes.findFirst({
    where: eq(networkNodes.id, nodeId),
    with: {
      medium: true,
      terytArea: true,
      simcLocality: true,
      street: true
    }
  })
  if (!node) throw createError({ statusCode: 404, statusMessage: 'Węzeł nie istnieje' })

  const connectedLines = await db.query.networkLines.findMany({
    where: (lines, { or }) => or(
      eq(lines.nodeStartId, nodeId),
      eq(lines.nodeEndId, nodeId)
    )
  })

  const connectedNodeIds = new Set<string>()
  for (const line of connectedLines) {
    if (line.nodeStartId) connectedNodeIds.add(line.nodeStartId)
    if (line.nodeEndId) connectedNodeIds.add(line.nodeEndId)
  }
  connectedNodeIds.delete(nodeId)

  const connectedNodes = connectedNodeIds.size > 0
    ? await db.query.networkNodes.findMany({
        where: (nodes, { inArray }) => inArray(nodes.id, [...connectedNodeIds]),
        with: {
          street: true,
          simcLocality: true
        }
      })
    : []

  const equipment = await db.query.networkEquipment.findMany({
    where: eq(networkEquipment.nodeId, nodeId),
    with: {
      model: true,
      customerDevices: {
        with: {
          customer: true,
          subscriptions: {
            with: { tariff: true }
          }
        }
      },
      onuCustomerDevices: {
        with: {
          customer: true,
          subscriptions: {
            with: { tariff: true }
          }
        }
      }
    }
  })

  const customerDeviceIds = new Set<string>()
  for (const item of equipment) {
    for (const device of item.customerDevices) customerDeviceIds.add(device.id)
    for (const device of item.onuCustomerDevices) customerDeviceIds.add(device.id)
  }

  return {
    success: true,
    data: {
      node: {
        ...node,
        address: formatAddress(node) || null,
        customerDeviceCount: customerDeviceIds.size,
        equipmentCount: equipment.length
      },
      connectedLines,
      connectedNodes: connectedNodes.map(item => ({
        ...item,
        address: formatAddress(item) || null
      })),
      equipment
    }
  }
})

import { apiHandler } from '../../utils/api-handler'
import { getQuery } from 'h3'
import { db } from '../../utils/db'

function limitFromQuery(value: unknown) {
  const limit = Number(value)
  if (!Number.isInteger(limit)) return 200
  return Math.min(Math.max(limit, 1), 1000)
}

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const limit = limitFromQuery(query.limit)
  const rows = await db.query.netflowRawFlows.findMany({
    orderBy: (table, { desc }) => [desc(table.exportedAt)],
    limit
  })

  return {
    success: true,
    data: rows.map(row => ({
      id: row.id,
      exporterAddress: row.exporterAddress,
      version: row.version,
      exportedAt: row.exportedAt.toISOString(),
      firstSeenAt: row.firstSeenAt?.toISOString() || null,
      lastSeenAt: row.lastSeenAt?.toISOString() || null,
      srcIp: row.srcIp,
      dstIp: row.dstIp,
      srcPort: row.srcPort,
      dstPort: row.dstPort,
      protocol: row.protocol,
      bytes: row.bytes,
      packets: row.packets,
      inputIfIndex: row.inputIfIndex,
      outputIfIndex: row.outputIfIndex,
      srcMac: row.srcMac,
      dstMac: row.dstMac,
      natSrcIp: row.natSrcIp,
      natDstIp: row.natDstIp,
      natSrcPort: row.natSrcPort,
      natDstPort: row.natDstPort,
      direction: row.flowDirection,
      localIp: row.localIp,
      remoteIp: row.remoteIp,
      userKey: row.userKey,
      customerDeviceId: row.customerDeviceId,
      customerId: row.customerId,
      confidence: row.confidence
    }))
  }
})

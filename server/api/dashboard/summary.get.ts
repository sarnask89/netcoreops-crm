import { apiHandler } from '../../utils/api-handler'
import { sql } from 'drizzle-orm'
import {
  customerDevices,
  customers,
  ftthOnus,
  networkEquipment,
  networkLines,
  networkNodes
} from '../../db/schema'
import { loadRecentGponRxAlerts } from '../../ftth/gpon-rx-monitor'
import type { NetflowInterfaceRole } from '../../netflow/interface-roles'
import { buildNetflowInterfaceRoleMaps } from '../../netflow/interface-roles'
import { db } from '../../utils/db'

function bucketHour(date: Date) {
  const bucket = new Date(date)
  bucket.setMinutes(0, 0, 0)
  return bucket.toISOString()
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function toOptionalNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

export default apiHandler(async () => {
  const [
    customerCount,
    customerDeviceCount,
    equipmentCount,
    nodeCount,
    lineCount,
    onuCount,
    activeOnuCount,
    diagnosticRows,
    netflowConfigRows,
    netflowRows,
    activeUserRows,
    activeUserScopeRows,
    flowRollupRows,
    healthRows,
    customerDeviceRows,
    equipmentRows,
    alerts
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(customers).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(customerDevices).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(networkEquipment).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(networkNodes).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(networkLines).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(ftthOnus).then(rows => rows[0]?.count || 0),
    db.select({ count: sql<number>`count(*)::int` }).from(ftthOnus).where(sql`${ftthOnus.status} = 'Active'`).then(rows => rows[0]?.count || 0),
    db.query.diagnosticRuns.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 500
    }),
    db.query.diagnosticRuns.findMany({
      where: (table, { eq }) => eq(table.runType, 'netflow-config'),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 200
    }),
    db.query.netflowInterfaceSamples.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 5000
    }),
    db.query.dhcpActiveUserSnapshots.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 1000
    }),
    db.query.dhcpActiveUserScopeCounts.findMany({
      limit: 5000
    }),
    db.query.netflowFlowRollups.findMany({
      orderBy: (table, { desc }) => [desc(table.bucket)],
      limit: 5000
    }),
    db.query.netflowExporterHealth.findMany({
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
      limit: 200
    }),
    db.query.customerDevices.findMany(),
    db.query.networkEquipment.findMany(),
    loadRecentGponRxAlerts(12)
  ])

  const telemetryBuckets = new Map<string, { timestamp: string, snmpSamples: number, netflowSamples: number, alerts: number }>()
  const interfaceRolesByExporter = buildNetflowInterfaceRoleMaps(netflowConfigRows, equipmentRows)
  const interfaceBuckets = new Map<string, {
    timestamp: string
    exporterAddress: string
    interfaceName: string
    role: NetflowInterfaceRole
    sourceInterface?: string
    speedBps?: number
    direction: 'input' | 'output'
    bytes: number
    bpsSum: number
    packets: number
    records: number
    samples: number
  }>()
  const activeUserBuckets = new Map<string, {
    timestamp: string
    scope: 'total' | 'equipment' | 'dhcp-server' | 'interface'
    key: string
    label: string
    count: number
    joined: number
    left: number
  }>()
  const activeGlobalBuckets = new Map<string, {
    activeKeys: Set<string>
    joined: number
    left: number
  }>()
  const deviceLabels = new Map(customerDeviceRows.map(row => [row.id, row.hostname]))
  for (const run of diagnosticRows) {
    const timestamp = bucketHour(run.createdAt)
    const bucket = telemetryBuckets.get(timestamp) || { timestamp, snmpSamples: 0, netflowSamples: 0, alerts: 0 }
    const runType = run.runType.toLowerCase()
    if (runType.includes('snmp') || runType.includes('diagnostic') || runType.includes('mikrotik')) bucket.snmpSamples += 1
    if (runType.includes('netflow')) bucket.netflowSamples += 1
    if (runType.includes('gpon-rx')) {
      const result = run.result as { alertCount?: number }
      bucket.alerts += result.alertCount || 0
    }
    telemetryBuckets.set(timestamp, bucket)
  }

  for (const row of netflowRows) {
    const roleFromConfig = typeof row.ifIndex === 'number'
      ? interfaceRolesByExporter.get(row.exporterAddress)?.get(row.ifIndex)
      : undefined
    const role = row.role === 'dhcp' || row.role === 'uplink' ? row.role : roleFromConfig?.role
    if (role !== 'dhcp' && role !== 'uplink') continue
    const timestamp = bucketHour(row.createdAt)
    const direction = row.direction === 'output' ? 'output' : 'input'
    const interfaceName = roleFromConfig?.name || row.interfaceName || (row.ifIndex ? `ifIndex ${row.ifIndex}` : 'unknown')
    const key = `${timestamp}|${row.exporterAddress}|${role}|${direction}|${interfaceName}`
    const interfaceBucket = interfaceBuckets.get(key) || {
      timestamp,
      exporterAddress: row.exporterAddress,
      interfaceName,
      role,
      sourceInterface: roleFromConfig?.sourceInterface || row.sourceInterface || undefined,
      speedBps: roleFromConfig?.speedBps || toOptionalNumber(row.speedBps),
      direction,
      bytes: 0,
      bpsSum: 0,
      packets: 0,
      records: 0,
      samples: 0
    }
    interfaceBucket.bytes += toNumber(row.bytes)
    interfaceBucket.bpsSum += toNumber(row.bps)
    interfaceBucket.packets += toNumber(row.packets)
    interfaceBucket.records += toNumber(row.records)
    interfaceBucket.samples += 1
    interfaceBuckets.set(key, interfaceBucket)
  }

  const scopeRowsBySnapshot = new Map<string, typeof activeUserScopeRows>()
  for (const row of activeUserScopeRows) {
    scopeRowsBySnapshot.set(row.snapshotId, [...(scopeRowsBySnapshot.get(row.snapshotId) || []), row])
  }
  for (const row of activeUserRows) {
    const timestamp = bucketHour(row.createdAt)
    const equipmentPoint = {
      scope: 'equipment' as const,
      key: `equipment|${row.inventoryId}`,
      label: row.inventoryId,
      count: row.activeUsers,
      joined: row.joinedUsers,
      left: row.leftUsers
    }
    const equipmentBucketKey = `${timestamp}|${equipmentPoint.key}`
    if (!activeUserBuckets.has(equipmentBucketKey)) {
      activeUserBuckets.set(equipmentBucketKey, { timestamp, ...equipmentPoint })
      const globalBucket = activeGlobalBuckets.get(timestamp) || { activeKeys: new Set<string>(), joined: 0, left: 0 }
      for (const activeKey of row.activeKeys || []) globalBucket.activeKeys.add(activeKey)
      globalBucket.joined += row.joinedUsers
      globalBucket.left += row.leftUsers
      activeGlobalBuckets.set(timestamp, globalBucket)
    }

    for (const scopeRow of scopeRowsBySnapshot.get(row.id) || []) {
      const scope = scopeRow.scope === 'dhcp-server' ? 'dhcp-server' : 'interface'
      const key = `${timestamp}|${scope}|${row.inventoryId}|${scopeRow.name}`
      if (activeUserBuckets.has(key)) continue
      activeUserBuckets.set(key, {
        timestamp,
        scope,
        key: `${scope}|${row.inventoryId}|${scopeRow.name}`,
        label: `${row.inventoryId} / ${scopeRow.name}`,
        count: scopeRow.count,
        joined: 0,
        left: 0
      })
    }
  }

  const topUsersByKey = new Map<string, {
    userKey: string
    label: string
    customerDeviceId?: string | null
    customerId?: string | null
    localIp?: string | null
    downloadBps: number
    uploadBps: number
    totalBytes: number
    flows: number
  }>()
  for (const row of flowRollupRows) {
    if (row.scope !== 'user' || row.bucketSeconds !== 60 || !row.userKey) continue
    const key = row.userKey
    const user = topUsersByKey.get(key) || {
      userKey: key,
      label: row.customerDeviceId ? (deviceLabels.get(row.customerDeviceId) || key) : (row.localIp || key),
      customerDeviceId: row.customerDeviceId,
      customerId: row.customerId,
      localIp: row.localIp,
      downloadBps: 0,
      uploadBps: 0,
      totalBytes: 0,
      flows: 0
    }
    if (row.direction === 'download') user.downloadBps += toNumber(row.bps)
    if (row.direction === 'upload') user.uploadBps += toNumber(row.bps)
    user.totalBytes += toNumber(row.bytes)
    user.flows += toNumber(row.flows)
    topUsersByKey.set(key, user)
  }

  const latestHealthByExporter = new Map<string, typeof healthRows[number]>()
  for (const row of healthRows) {
    const key = `${row.exporterAddress}|${row.version}|${row.sourceId}`
    if (!latestHealthByExporter.has(key)) latestHealthByExporter.set(key, row)
  }

  return {
    success: true,
    data: {
      counters: {
        customers: customerCount,
        customerDevices: customerDeviceCount,
        equipment: equipmentCount,
        nodes: nodeCount,
        lines: lineCount,
        onus: onuCount,
        activeOnus: activeOnuCount,
        gponAlerts: alerts.length
      },
      alerts,
      telemetry: Array.from(telemetryBuckets.values())
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .slice(-48),
      netflowInterfaces: Array.from(interfaceBuckets.values())
        .map((point) => {
          const bps = point.samples > 0 ? point.bpsSum / point.samples : 0
          const utilizationPct = point.speedBps ? (bps / point.speedBps) * 100 : null
          return {
            timestamp: point.timestamp,
            exporterAddress: point.exporterAddress,
            interfaceName: point.interfaceName,
            role: point.role,
            sourceInterface: point.sourceInterface,
            speedBps: point.speedBps,
            direction: point.direction,
            bytes: point.bytes,
            bps,
            utilizationPct,
            packets: point.packets,
            records: point.records,
            samples: point.samples
          }
        })
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .slice(-2000),
      activeUsers: Array.from(activeUserBuckets.values())
        .concat(Array.from(activeGlobalBuckets.entries()).map(([timestamp, point]) => ({
          timestamp,
          scope: 'total' as const,
          key: 'total|all',
          label: 'Wszyscy',
          count: point.activeKeys.size,
          joined: point.joined,
          left: point.left
        })))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .slice(-2000),
      collectorHealth: Array.from(latestHealthByExporter.values()).map(row => ({
        exporterAddress: row.exporterAddress,
        version: row.version,
        sourceId: row.sourceId,
        packetCount: toNumber(row.packetCount),
        flowRecords: toNumber(row.flowRecords),
        unknownTemplateRecords: toNumber(row.unknownTemplateRecords),
        sequenceGaps: toNumber(row.sequenceGaps),
        templatesRefreshed: toNumber(row.templatesRefreshed),
        lastSequence: toNumber(row.lastSequence),
        lastPacketAt: row.lastPacketAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })),
      topUsers: Array.from(topUsersByKey.values())
        .sort((a, b) => (b.downloadBps + b.uploadBps) - (a.downloadBps + a.uploadBps))
        .slice(0, 12)
    }
  }
})

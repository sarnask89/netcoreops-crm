import 'dotenv/config'
import { createSocket } from 'node:dgram'
import {
  customerDevices,
  diagnosticRuns,
  ipNetworks,
  netflowCollectorTemplates,
  netflowExporterHealth,
  netflowFlowRollups,
  netflowInterfaceSamples,
  netflowRawFlows
} from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { createNetflowAccumulator, createNetflowParser, type NetflowAggregate } from '../server/netflow/collector'
import type { NetflowInterfaceRoleConfig } from '../server/netflow/interface-roles'
import { buildNetflowInterfaceRoleMaps } from '../server/netflow/interface-roles'
import { aggregateFlowRecords, enrichFlowRecord } from '../server/netflow/flow-analytics'

const portArg = process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1]
const port = Number(portArg || process.env.NETCOREOPS_NETFLOW_PORT || 2055)
const bindAddress = process.env.NETCOREOPS_NETFLOW_BIND || '0.0.0.0'
const flushMs = Number(process.env.NETCOREOPS_NETFLOW_FLUSH_MS || 10000)
const accumulator = createNetflowAccumulator()
const parser = createNetflowParser()
const socket = createSocket('udp4')
let flushTimer: NodeJS.Timeout | null = null
let flushing = false
let roleCache: { loadedAt: number, rolesByExporter: Map<string, Map<number, NetflowInterfaceRoleConfig>> } | null = null
let enrichmentCache: {
  loadedAt: number
  localNetworks: string[]
  devices: Array<{ id: string, customerId: string | null, hostname: string, ipAddress: string | null, macAddress: string | null }>
} | null = null

const fallbackLocalNetworks = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10']

async function equipmentIdByExporter(exporterAddress: string) {
  const equipment = await db.query.networkEquipment.findFirst({
    where: (table, { eq }) => eq(table.managementIp, exporterAddress)
  })
  return equipment?.id || null
}

async function interfaceRolesByExporter(exporterAddress: string) {
  const now = Date.now()
  if (!roleCache || now - roleCache.loadedAt > 60_000) {
    const [equipmentRows, diagnosticRows] = await Promise.all([
      db.query.networkEquipment.findMany(),
      db.query.diagnosticRuns.findMany({
        where: (table, { eq }) => eq(table.runType, 'netflow-config'),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit: 200
      })
    ])
    roleCache = {
      loadedAt: now,
      rolesByExporter: buildNetflowInterfaceRoleMaps(diagnosticRows, equipmentRows)
    }
  }
  return roleCache.rolesByExporter.get(exporterAddress) || new Map<number, NetflowInterfaceRoleConfig>()
}

async function flowEnrichmentContext() {
  const now = Date.now()
  if (!enrichmentCache || now - enrichmentCache.loadedAt > 60_000) {
    const [networkRows, deviceRows] = await Promise.all([
      db.select().from(ipNetworks),
      db.select().from(customerDevices)
    ])
    const localNetworks = networkRows
      .filter(row => row.status === 'ACTIVE')
      .map(row => row.cidr)
      .filter(Boolean)
    enrichmentCache = {
      loadedAt: now,
      localNetworks: localNetworks.length ? localNetworks : fallbackLocalNetworks,
      devices: deviceRows.map(row => ({
        id: row.id,
        customerId: row.customerId,
        hostname: row.hostname,
        ipAddress: row.ipAddress,
        macAddress: row.macAddress
      }))
    }
  }
  return enrichmentCache
}

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null
}

function dateFromIso(value: string) {
  return new Date(value)
}

async function insertChunks<T>(rows: T[], insert: (chunk: T[]) => Promise<unknown>, size = 100) {
  for (let offset = 0; offset < rows.length; offset += size) {
    await insert(rows.slice(offset, offset + size))
  }
}

async function insertFlowTelemetry(aggregate: NetflowAggregate) {
  await db.insert(netflowExporterHealth).values({
    exporterAddress: aggregate.exporterAddress,
    version: aggregate.version,
    sourceId: aggregate.sourceIds[0] || 0,
    packetCount: aggregate.packetCount,
    flowRecords: aggregate.flowRecords.length,
    unknownTemplateRecords: aggregate.collectorHealth.unknownTemplateRecords,
    sequenceGaps: aggregate.collectorHealth.sequenceGaps,
    templatesRefreshed: aggregate.collectorHealth.templatesRefreshed,
    lastSequence: aggregate.lastSequence,
    lastPacketAt: dateFromIso(aggregate.lastExportedAt)
  })

  if (aggregate.templates.length) {
    const templateRows = aggregate.templates.map(template => ({
      exporterAddress: template.exporterAddress,
      version: template.version,
      sourceId: template.sourceId,
      templateId: template.templateId,
      fields: template.fields,
      refreshedAt: dateFromIso(template.refreshedAt),
      lastSeenAt: dateFromIso(aggregate.lastExportedAt)
    }))
    await insertChunks(templateRows, chunk => db.insert(netflowCollectorTemplates).values(chunk))
  }

  if (!aggregate.flowRecords.length) return

  const context = await flowEnrichmentContext()
  const enrichedRecords = aggregate.flowRecords.map(record => enrichFlowRecord(record, context))
  const rawRows = enrichedRecords.map(record => ({
    exporterAddress: record.exporterAddress,
    exporterPort: record.exporterPort,
    version: record.version,
    sourceId: record.sourceId,
    sequence: record.sequence,
    exportedAt: dateFromIso(record.exportedAt),
    firstSeenAt: dateOrNull(record.firstSeenAt),
    lastSeenAt: dateOrNull(record.lastSeenAt),
    srcIp: record.srcIp,
    dstIp: record.dstIp,
    srcPort: record.srcPort,
    dstPort: record.dstPort,
    protocol: record.protocol,
    tcpFlags: record.tcpFlags,
    tos: record.tos,
    bytes: record.bytes,
    packets: record.packets,
    inputIfIndex: record.inputIfIndex,
    outputIfIndex: record.outputIfIndex,
    srcMac: record.srcMac,
    dstMac: record.dstMac,
    natSrcIp: record.natSrcIp,
    natDstIp: record.natDstIp,
    natSrcPort: record.natSrcPort,
    natDstPort: record.natDstPort,
    flowDirection: record.direction,
    localIp: record.localIp,
    remoteIp: record.remoteIp,
    userKey: record.userKey,
    customerDeviceId: record.customerDeviceId,
    customerId: record.customerId,
    confidence: record.confidence
  }))
  await insertChunks(rawRows, chunk => db.insert(netflowRawFlows).values(chunk), 50)

  for (const bucketSeconds of [60, 300]) {
    const rollups = aggregateFlowRecords(enrichedRecords, bucketSeconds)
    const rows = [
      ...rollups.interfaceRollups.map(row => ({
        bucket: dateFromIso(row.bucket),
        bucketSeconds,
        exporterAddress: row.exporterAddress,
        scope: 'interface',
        ifIndex: row.ifIndex,
        direction: row.direction,
        bytes: row.bytes,
        packets: row.packets,
        flows: row.flows,
        bps: row.bps
      })),
      ...rollups.userRollups.map(row => ({
        bucket: dateFromIso(row.bucket),
        bucketSeconds,
        exporterAddress: row.exporterAddress,
        scope: 'user',
        userKey: row.userKey,
        customerDeviceId: row.customerDeviceId,
        customerId: row.customerId,
        localIp: row.localIp,
        direction: row.direction,
        bytes: row.bytes,
        packets: row.packets,
        flows: row.flows,
        bps: row.bps
      }))
    ]
    if (rows.length) await insertChunks(rows, chunk => db.insert(netflowFlowRollups).values(chunk), 100)
  }
}

async function flushAggregates() {
  if (flushing) return
  flushing = true
  try {
    const aggregates = accumulator.flush()
    for (const aggregate of aggregates) {
      const equipmentId = await equipmentIdByExporter(aggregate.exporterAddress)
      const sampleWindowSeconds = Math.max(flushMs / 1000, 1)
      await db.insert(diagnosticRuns).values({
        driverCode: 'netflow_collector',
        runType: 'netflow-received',
        target: `${aggregate.exporterAddress}/v${aggregate.version}`,
        success: true,
        result: {
          name: 'netflow-received',
          status: 'ok',
          data: {
            ...aggregate,
            windowMs: flushMs,
            collectorHealth: aggregate.collectorHealth,
            flowRecordCount: aggregate.flowRecords.length
          }
        }
      })
      if (aggregate.interfaceFlows.length) {
        const interfaceRoles = await interfaceRolesByExporter(aggregate.exporterAddress)
        await db.insert(netflowInterfaceSamples).values(aggregate.interfaceFlows.map((flow) => {
          const role = interfaceRoles.get(flow.ifIndex)
          return {
            equipmentId,
            exporterAddress: aggregate.exporterAddress,
            version: aggregate.version,
            ifIndex: flow.ifIndex,
            interfaceName: role?.name || `ifIndex ${flow.ifIndex}`,
            role: role?.role || 'unknown',
            sourceInterface: role?.sourceInterface || null,
            direction: flow.direction,
            bytes: flow.bytes,
            packets: flow.packets,
            records: flow.records,
            bps: (flow.bytes * 8) / sampleWindowSeconds,
            speedBps: role?.speedBps || null,
            sampleWindowSeconds
          }
        }))
      }
      await insertFlowTelemetry(aggregate)
      console.log(JSON.stringify({
        event: 'netflow-flush',
        exporterAddress: aggregate.exporterAddress,
        version: aggregate.version,
        packetCount: aggregate.packetCount,
        recordCount: aggregate.recordCount,
        interfaceFlowCount: aggregate.interfaceFlows.length,
        flowRecordCount: aggregate.flowRecords.length,
        collectorHealth: aggregate.collectorHealth
      }))
    }
  } finally {
    flushing = false
  }
}

async function shutdown() {
  if (flushTimer) clearInterval(flushTimer)
  await flushAggregates().catch(error => console.error(error))
  socket.close()
  await pool.end()
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('NETCOREOPS_NETFLOW_PORT musi być portem TCP/UDP z zakresu 1-65535')
}

socket.on('message', (message, remote) => {
  const parsed = parser.parse(message, remote)
  if (!parsed) {
    console.warn(JSON.stringify({
      event: 'netflow-unsupported-packet',
      from: `${remote.address}:${remote.port}`,
      bytes: message.length,
      version: message.length >= 2 ? message.readUInt16BE(0) : null
    }))
    return
  }

  accumulator.add(parsed)
})

socket.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})

socket.bind(port, bindAddress, () => {
  const address = socket.address()
  console.log(JSON.stringify({
    event: 'netflow-listening',
    address
  }))
})

flushTimer = setInterval(() => {
  flushAggregates().catch(error => console.error(error))
}, flushMs)

process.once('SIGINT', () => shutdown().finally(() => process.exit(0)))
process.once('SIGTERM', () => shutdown().finally(() => process.exit(0)))

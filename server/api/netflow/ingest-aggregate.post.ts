import { createError, getHeader, getRequestIP, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { diagnosticRuns, netflowInterfaceSamples, networkEquipment } from '../../db/schema'
import type { NetflowInterfaceRoleConfig } from '../../netflow/interface-roles'
import { buildNetflowInterfaceRoleMaps } from '../../netflow/interface-roles'
import { db } from '../../utils/db'

interface NetflowAggregateBody {
  exporterAddress?: string
  version?: number
  packetCount?: number
  recordCount?: number
  bytes?: number
  firstExportedAt?: string | null
  lastExportedAt?: string | null
  windowMs?: number
  lastSequence?: number | null
  sourceIds?: number[]
  relayAddress?: string
  interfaceFlows?: Array<{
    direction?: string
    ifIndex?: number
    bytes?: number
    packets?: number
    records?: number
  }>
}

function isLocalIngestSource(address: string) {
  return address === '127.0.0.1'
    || address === '::1'
    || address === '::ffff:127.0.0.1'
    || address === '10.0.87.224'
    || address === '::ffff:10.0.87.224'
}

function toPositiveNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

interface InterfaceRolesAndEquipment {
  equipment: (typeof networkEquipment.$inferSelect) | undefined
  interfaceRoles: Map<number, NetflowInterfaceRoleConfig>
}

async function loadInterfaceRolesAndEquipment(exporterAddress: string): Promise<InterfaceRolesAndEquipment> {
  // Load all required data in parallel to reduce query count
  const [equipment, equipmentRows, diagnosticRows] = await Promise.all([
    db.query.networkEquipment.findFirst({
      where: eq(networkEquipment.managementIp, exporterAddress)
    }),
    db.query.networkEquipment.findMany(),
    db.query.diagnosticRuns.findMany({
      where: (table, { eq }) => eq(table.runType, 'netflow-config'),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 200
    })
  ])

  return {
    equipment,
    interfaceRoles: buildNetflowInterfaceRoleMaps(diagnosticRows, equipmentRows).get(exporterAddress) || new Map<number, NetflowInterfaceRoleConfig>()
  }
}

export default defineEventHandler(async (event) => {
  const requestIp = getRequestIP(event, { xForwardedFor: false }) || ''
  const ingestToken = process.env.NETCOREOPS_NETFLOW_INGEST_TOKEN
  const requestToken = getHeader(event, 'x-netcoreops-netflow-token')
  const isTokenAuthorized = Boolean(ingestToken && requestToken === ingestToken)
  if (!isTokenAuthorized && !isLocalIngestSource(requestIp)) {
    throw createError({ statusCode: 403, statusMessage: 'NetFlow ingest jest dostępny tylko lokalnie' })
  }

  const body = await readBody<NetflowAggregateBody>(event)
  const exporterAddress = typeof body.exporterAddress === 'string' ? body.exporterAddress.trim() : ''
  const version = toPositiveNumber(body.version)
  const packetCount = toPositiveNumber(body.packetCount)
  const recordCount = toPositiveNumber(body.recordCount)
  const bytes = toPositiveNumber(body.bytes)

  if (!exporterAddress || !version || packetCount === null || recordCount === null || bytes === null) {
    throw createError({ statusCode: 400, statusMessage: 'Nieprawidłowy agregat NetFlow' })
  }

  // Load equipment and interface roles in parallel
  const { equipment, interfaceRoles } = await loadInterfaceRolesAndEquipment(exporterAddress)

  const interfaceFlows = Array.isArray(body.interfaceFlows)
    ? body.interfaceFlows.map((flow) => {
        const ifIndex = toPositiveNumber(flow.ifIndex)
        const role = ifIndex === null ? undefined : interfaceRoles.get(ifIndex)
        return {
          direction: flow.direction === 'output' ? 'output' : 'input',
          ifIndex,
          interfaceName: role?.name || (ifIndex === null ? 'unknown' : `ifIndex ${ifIndex}`),
          role: role?.role || 'unknown',
          sourceInterface: role?.sourceInterface,
          speedBps: role?.speedBps,
          bytes: toPositiveNumber(flow.bytes) || 0,
          packets: toPositiveNumber(flow.packets) || 0,
          records: toPositiveNumber(flow.records) || 0
        }
      })
    : []

  const aggregate = {
    exporterAddress,
    version,
    packetCount,
    recordCount,
    bytes,
    firstExportedAt: body.firstExportedAt || null,
    lastExportedAt: body.lastExportedAt || null,
    windowMs: toPositiveNumber(body.windowMs),
    lastSequence: typeof body.lastSequence === 'number' ? body.lastSequence : null,
    sourceIds: Array.isArray(body.sourceIds) ? body.sourceIds.filter(Number.isFinite) : [],
    relayAddress: body.relayAddress || requestIp,
    interfaceFlows
  }

  await db.insert(diagnosticRuns).values({
    driverCode: 'netflow_windows_relay',
    runType: 'netflow-received',
    target: `${aggregate.exporterAddress}/v${aggregate.version}`,
    success: true,
    result: {
      name: 'netflow-received',
      status: 'ok',
      data: aggregate
    }
  })

  if (interfaceFlows.length) {
    const sampleWindowSeconds = Math.max((toPositiveNumber(body.windowMs) || 10000) / 1000, 1)
    await db.insert(netflowInterfaceSamples).values(interfaceFlows.map(flow => ({
      equipmentId: equipment?.id || null,
      exporterAddress,
      version,
      ifIndex: flow.ifIndex,
      interfaceName: flow.interfaceName,
      role: flow.role,
      sourceInterface: flow.sourceInterface || null,
      direction: flow.direction,
      bytes: flow.bytes,
      packets: flow.packets,
      records: flow.records,
      bps: (flow.bytes * 8) / sampleWindowSeconds,
      speedBps: flow.speedBps || null,
      sampleWindowSeconds
    })))
  }

  return { ok: true, aggregate }
})

/**
 * MikroTik SNMP poller.
 *
 * Polls a device across three domains and returns a structured result:
 * - Simple queues (name, bytes, packets, drops, PCQ queue depth)
 * - Interfaces (64-bit traffic counters, errors, discards, speed, status)
 * - System resources (CPU, memory, temperature, uptime, version)
 */
import * as OID from './mikrotik-oids'
import { createSession, walkOid, getOids } from './client'
import type { SnmpVarbind, SnmpSession } from './client'

// ── Types ───────────────────────────────────────────────────────────────

export interface SnmpQueuePoint {
  name: string
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  droppedIn: number
  droppedOut: number
  pcqQueuesIn: number
  pcqQueuesOut: number
}

export interface SnmpInterfacePoint {
  name: string
  ifIndex: number
  hcInOctets: number
  hcOutOctets: number
  highSpeed: number
  speed: number
  adminStatus: number
  operStatus: number
  inErrors: number
  outErrors: number
  inDiscards: number
  outDiscards: number
}

export interface SnmpSystemPoint {
  cpuLoad: number | null
  uptime: number | null
  temperature: number | null
  totalMemory: number | null
  freeMemory: number | null
  totalHdd: number | null
  freeHdd: number | null
  boardName: string | null
  version: string | null
  architecture: string | null
}

export interface SnmpPollResult {
  success: boolean
  error?: string
  queues: SnmpQueuePoint[]
  interfaces: SnmpInterfacePoint[]
  system: SnmpSystemPoint
  polledAt: string
}

// ── Helpers ─────────────────────────────────────────────────────────────

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

/**
 * Walk a table whose column OIDs each carry the per-row index as suffix.
 *
 * Walks several columns in parallel and groups them by row index.
 *
 * @param session - SNMP session
 * @param columns  - map of columnName → column OID (the base for that column)
 * @returns map of rowIndex → map of columnName → value
 */
async function walkTable(
  session: SnmpSession,
  columns: Record<string, string>
): Promise<Map<string, Record<string, unknown>>> {
  const entries = Object.entries(columns)
  const walks = await Promise.all(
    entries.map(async ([name, oid]) => {
      const varbinds = await walkOid(session, oid).catch(() => [] as SnmpVarbind[])
      return { name, varbinds }
    })
  )

  const rows = new Map<string, Record<string, unknown>>()

  for (const { name, varbinds } of walks) {
    for (const vb of varbinds) {
      // Extract the row index from the OID suffix.
      // Column base: .1.3.6.1.x.y.z.columnIndex
      // Full OID:    .1.3.6.1.x.y.z.columnIndex.rowIndex
      // Row index is the last numeric component
      const parts = vb.oid.split('.')
      const rowIdx = parts[parts.length - 1]
      if (!rowIdx || !/^\d+$/.test(rowIdx)) continue

      if (!rows.has(rowIdx)) {
        rows.set(rowIdx, {})
      }
      (rows.get(rowIdx)! as Record<string, unknown>)[name] = vb.value
    }
  }

  return rows
}

// ── Pollers ─────────────────────────────────────────────────────────────

async function pollQueues(session: SnmpSession): Promise<SnmpQueuePoint[]> {
  const columns = {
    name: OID.OID_SQ_NAME,
    bytesIn: OID.OID_SQ_BYTES_IN,
    bytesOut: OID.OID_SQ_BYTES_OUT,
    packetsIn: OID.OID_SQ_PACKETS_IN,
    packetsOut: OID.OID_SQ_PACKETS_OUT,
    droppedIn: OID.OID_SQ_DROPPED_IN,
    droppedOut: OID.OID_SQ_DROPPED_OUT,
    pcqQueuesIn: OID.OID_SQ_PCQ_QUEUES_IN,
    pcqQueuesOut: OID.OID_SQ_PCQ_QUEUES_OUT
  }

  const rows = await walkTable(session, columns)
  const results: SnmpQueuePoint[] = []

  for (const [, row] of rows) {
    const name = String(row.name || '')
    if (!name) continue

    results.push({
      name,
      bytesIn: toNumber(row.bytesIn),
      bytesOut: toNumber(row.bytesOut),
      packetsIn: toNumber(row.packetsIn),
      packetsOut: toNumber(row.packetsOut),
      droppedIn: toNumber(row.droppedIn),
      droppedOut: toNumber(row.droppedOut),
      pcqQueuesIn: toNumber(row.pcqQueuesIn),
      pcqQueuesOut: toNumber(row.pcqQueuesOut)
    })
  }

  return results
}

async function pollInterfaces(session: SnmpSession): Promise<SnmpInterfacePoint[]> {
  // Walk name + 64-bit counters from ifXTable
  const ifxColumns = {
    name: OID.OID_IFX_NAME,
    hcInOctets: OID.OID_IFX_HC_IN_OCTETS,
    hcOutOctets: OID.OID_IFX_HC_OUT_OCTETS,
    highSpeed: OID.OID_IFX_HIGH_SPEED
  }
  const ifxRows = await walkTable(session, ifxColumns)

  // Walk errors/discards/status from ifTable
  const ifColumns = {
    descr: OID.OID_IF_DESCR,
    speed: OID.OID_IF_SPEED,
    adminStatus: OID.OID_IF_ADMIN_STATUS,
    operStatus: OID.OID_IF_OPER_STATUS,
    inErrors: OID.OID_IF_IN_ERRORS,
    outErrors: OID.OID_IF_OUT_ERRORS,
    inDiscards: OID.OID_IF_IN_DISCARDS,
    outDiscards: OID.OID_IF_OUT_DISCARDS
  }
  const ifRows = await walkTable(session, ifColumns)

  const results: SnmpInterfacePoint[] = []
  const allIndexes = new Set([...ifxRows.keys(), ...ifRows.keys()])

  for (const idx of allIndexes) {
    const ifx = ifxRows.get(idx)
    const ift = ifRows.get(idx)
    const name = String(ifx?.name || ift?.descr || '')
    if (!name) continue

    results.push({
      name,
      ifIndex: parseInt(idx, 10),
      hcInOctets: toNumber(ifx?.hcInOctets),
      hcOutOctets: toNumber(ifx?.hcOutOctets),
      highSpeed: toNumber(ifx?.highSpeed),
      speed: toNumber(ift?.speed),
      adminStatus: toNumber(ift?.adminStatus),
      operStatus: toNumber(ift?.operStatus),
      inErrors: toNumber(ift?.inErrors),
      outErrors: toNumber(ift?.outErrors),
      inDiscards: toNumber(ift?.inDiscards),
      outDiscards: toNumber(ift?.outDiscards)
    })
  }

  return results
}

async function pollSystem(session: SnmpSession): Promise<SnmpSystemPoint> {
  const scalarOids = [
    OID.OID_CPU_LOAD,
    OID.OID_UPTIME,
    OID.OID_TEMPERATURE,
    OID.OID_TOTAL_MEMORY,
    OID.OID_FREE_MEMORY,
    OID.OID_TOTAL_HDS,
    OID.OID_FREE_HDS,
    OID.OID_BOARD_NAME,
    OID.OID_VERSION,
    OID.OID_ARCHITECTURE
  ]

  const results = await getOids(session, scalarOids).catch(() => [])

  const map = new Map(results.map(r => [r.oid, r]))

  function scalar(oid: string) {
    const vb = map.get(oid)
    return vb?.endOfMib ? null : (vb?.value ?? null)
  }

  return {
    cpuLoad: toNumber(scalar(OID.OID_CPU_LOAD)),
    uptime: toNumber(scalar(OID.OID_UPTIME)),
    temperature: toNumber(scalar(OID.OID_TEMPERATURE)),
    totalMemory: toNumber(scalar(OID.OID_TOTAL_MEMORY)),
    freeMemory: toNumber(scalar(OID.OID_FREE_MEMORY)),
    totalHdd: toNumber(scalar(OID.OID_TOTAL_HDS)),
    freeHdd: toNumber(scalar(OID.OID_FREE_HDS)),
    boardName: scalar(OID.OID_BOARD_NAME) as string | null,
    version: scalar(OID.OID_VERSION) as string | null,
    architecture: scalar(OID.OID_ARCHITECTURE) as string | null
  }
}

// ── Top-level poll ──────────────────────────────────────────────────────

/**
 * Poll all SNMP domains for a MikroTik device.
 *
 * @param host - Management IP
 * @param community - SNMP read community string (plaintext, already decrypted)
 * @param options - Optional session overrides (port, timeout, etc.)
 */
export async function pollMikrotikSnmp(
  host: string,
  community: string,
  options?: { port?: number, timeout?: number }
): Promise<SnmpPollResult> {
  const session = createSession(host, community, {
    port: options?.port ?? 161,
    timeout: options?.timeout ?? 8000,
    retries: 1
  })

  const polledAt = new Date().toISOString()

  try {
    const [queues, interfaces, system] = await Promise.all([
      pollQueues(session),
      pollInterfaces(session),
      pollSystem(session)
    ])

    return {
      success: true,
      queues,
      interfaces,
      system,
      polledAt
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: message,
      queues: [],
      interfaces: [],
      system: {
        cpuLoad: null,
        uptime: null,
        temperature: null,
        totalMemory: null,
        freeMemory: null,
        totalHdd: null,
        freeHdd: null,
        boardName: null,
        version: null,
        architecture: null
      },
      polledAt
    }
  } finally {
    session.close()
  }
}

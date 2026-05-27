/**
 * MikroTik RouterOS SNMP OID constants
 *
 * Base OID: 1.3.6.1.4.1.14988.1 (mtxr)
 * Standard MIB-II: 1.3.6.1.2.1
 */

// ── System / Resources (mtxrSystem) ──────────────────────────────────────
export const MIB_SYSTEM = '.1.3.6.1.4.1.14988.1.1.3'

export const OID_CPU_LOAD = `${MIB_SYSTEM}.1.3.8.0` // INTEGER
export const OID_UPTIME = `${MIB_SYSTEM}.1.3.9.0` // Timeticks
export const OID_TEMPERATURE = `${MIB_SYSTEM}.1.3.10.0` // INTEGER (Celsius) — may not exist on all models
export const OID_TOTAL_MEMORY = `${MIB_SYSTEM}.1.3.11.0` // KB
export const OID_FREE_MEMORY = `${MIB_SYSTEM}.1.3.12.0` // KB
export const OID_TOTAL_HDS = `${MIB_SYSTEM}.1.3.13.0` // KB
export const OID_FREE_HDS = `${MIB_SYSTEM}.1.3.14.0` // KB
export const OID_ARCHITECTURE = `${MIB_SYSTEM}.1.3.20.0` // STRING
export const OID_BOARD_NAME = `${MIB_SYSTEM}.1.3.21.0` // STRING
export const OID_VERSION = `${MIB_SYSTEM}.1.3.22.0` // STRING

// ── Simple Queue (mtxrQueueSimpleTable) ─────────────────────────────────
// .1.3.6.1.4.1.14988.1.1.2.1
// Indexed by .1 (queue ID)
export const OID_SIMPLE_QUEUE_BASE = '.1.3.6.1.4.1.14988.1.1.2.1'

export const OID_SQ_NAME = '.1.3.6.1.4.1.14988.1.1.2.1.1.2' // STRING
export const OID_SQ_BYTES_IN = '.1.3.6.1.4.1.14988.1.1.2.1.1.8' // Counter64
export const OID_SQ_BYTES_OUT = '.1.3.6.1.4.1.14988.1.1.2.1.1.9' // Counter64
export const OID_SQ_PACKETS_IN = '.1.3.6.1.4.1.14988.1.1.2.1.1.10' // Counter64
export const OID_SQ_PACKETS_OUT = '.1.3.6.1.4.1.14988.1.1.2.1.1.11' // Counter64
export const OID_SQ_PCQ_QUEUES_IN = '.1.3.6.1.4.1.14988.1.1.2.1.1.12' // Gauge32
export const OID_SQ_PCQ_QUEUES_OUT = '.1.3.6.1.4.1.14988.1.1.2.1.1.13' // Gauge32
export const OID_SQ_DROPPED_IN = '.1.3.6.1.4.1.14988.1.1.2.1.1.14' // Counter64
export const OID_SQ_DROPPED_OUT = '.1.3.6.1.4.1.14988.1.1.2.1.1.15' // Counter64

// ── Queue Tree (mtxrQueueTreeTable) ─────────────────────────────────────
// .1.3.6.1.4.1.14988.1.1.2.2
export const OID_QUEUE_TREE_BASE = '.1.3.6.1.4.1.14988.1.1.2.2'
export const OID_QT_NAME = '.1.3.6.1.4.1.14988.1.1.2.2.1.2' // STRING
export const OID_QT_PARENT = '.1.3.6.1.4.1.14988.1.1.2.2.1.3' // STRING
export const OID_QT_BYTES_IN = '.1.3.6.1.4.1.14988.1.1.2.2.1.8' // Counter64
export const OID_QT_BYTES_OUT = '.1.3.6.1.4.1.14988.1.1.2.2.1.9' // Counter64
export const OID_QT_PACKETS_IN = '.1.3.6.1.4.1.14988.1.1.2.2.1.10' // Counter64
export const OID_QT_PACKETS_OUT = '.1.3.6.1.4.1.14988.1.1.2.2.1.11' // Counter64
export const OID_QT_DROPPED_IN = '.1.3.6.1.4.1.14988.1.1.2.2.1.14' // Counter64
export const OID_QT_DROPPED_OUT = '.1.3.6.1.4.1.14988.1.1.2.2.1.15' // Counter64

// ── Interface 64-bit counters (MIB-II ifXTable) ─────────────────────────
// Standard .1.3.6.1.2.1.31.1.1.1
// Indexed by ifIndex
export const OID_IFX_BASE = '.1.3.6.1.2.1.31.1.1.1'

export const OID_IFX_NAME = '.1.3.6.1.2.1.31.1.1.1.1' // STRING
export const OID_IFX_HC_IN_OCTETS = '.1.3.6.1.2.1.31.1.1.1.6' // Counter64 — 64-bit inbound bytes
export const OID_IFX_HC_OUT_OCTETS = '.1.3.6.1.2.1.31.1.1.1.10' // Counter64 — 64-bit outbound bytes
export const OID_IFX_HIGH_SPEED = '.1.3.6.1.2.1.31.1.1.1.15' // Gauge32 — ifHighSpeed in Mb/s

// ── Interface errors (MIB-II ifTable) ───────────────────────────────────
// Standard .1.3.6.1.2.1.2.2.1
export const OID_IF_BASE = '.1.3.6.1.2.1.2.2.1'

export const OID_IF_DESCR = '.1.3.6.1.2.1.2.2.1.2' // STRING
export const OID_IF_SPEED = '.1.3.6.1.2.1.2.2.1.5' // Gauge32 — ifSpeed in bps
export const OID_IF_ADMIN_STATUS = '.1.3.6.1.2.1.2.2.1.7' // INTEGER (1=up, 2=down)
export const OID_IF_OPER_STATUS = '.1.3.6.1.2.1.2.2.1.8' // INTEGER (1=up, 2=down)
export const OID_IF_IN_OCTETS = '.1.3.6.1.2.1.2.2.1.10' // Counter32 — 32-bit inbound bytes (fallback)
export const OID_IF_OUT_OCTETS = '.1.3.6.1.2.1.2.2.1.16' // Counter32 — 32-bit outbound bytes (fallback)
export const OID_IF_IN_ERRORS = '.1.3.6.1.2.1.2.2.1.14' // Counter32
export const OID_IF_OUT_ERRORS = '.1.3.6.1.2.1.2.2.1.20' // Counter32
export const OID_IF_IN_DISCARDS = '.1.3.6.1.2.1.2.2.1.13' // Counter32
export const OID_IF_OUT_DISCARDS = '.1.3.6.1.2.1.2.2.1.19' // Counter32

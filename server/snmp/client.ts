/**
 * SNMP client wrapper around net-snmp.
 *
 * Provides promisified walk/get helpers with consistent error handling.
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const snmp = require('net-snmp') as SnmpModule

interface SnmpVarbindRaw {
  oid: string
  type: number
  value: unknown
}

interface SnmpModule {
  createSession(host: string, community: string, options?: {
    port?: number
    version?: number
    timeout?: number
    retries?: number
  }): SnmpRawSession
  isVarbindError(varbind: SnmpVarbindRaw): boolean
  varbindError(varbind: SnmpVarbindRaw): string
  Version1: number
  Version2c: number
  Version3: number
  ObjectType: {
    Boolean: number
    Integer: number
    BitString: number
    OctetString: number
    Null: number
    OID: number
    IpAddress: number
    Counter: number
    Gauge: number
    TimeTicks: number
    Opaque: number
    Counter64: number
    NoSuchObject: number
    NoSuchInstance: number
    EndOfMibView: number
  }
}

interface SnmpRawSession {
  get(oids: string[], callback: (error: Error | null, varbinds: SnmpVarbindRaw[]) => void): void
  walk(
    oid: string,
    maxRepetitions: number,
    feedCallback: (varbinds: SnmpVarbindRaw[]) => void,
    doneCallback: (error: Error | null) => void
  ): void
  close(): void
  on(event: string, handler: (...args: unknown[]) => void): void
}

export interface SnmpVarbind {
  oid: string
  type: number
  value: string | number | Buffer | object | null
  /** true if this varbind signals end-of-MIB-view */
  endOfMib?: boolean
}

export interface SnmpSession {
  raw: SnmpRawSession
  close: () => void
}

export interface SnmpSessionOptions {
  port: number
  version: number
  timeout: number
  retries: number
}

const DEFAULT_OPTIONS: SnmpSessionOptions = {
  port: 161,
  version: snmp.Version2c,
  timeout: 5000,
  retries: 1
}

/**
 * Create an SNMPv2c session.
 *
 * The community string is the SNMP read community (e.g. "public").
 * Returns a wrapped session that must be closed after use.
 */
export function createSession(
  host: string,
  community: string,
  options?: Partial<SnmpSessionOptions>
): SnmpSession {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const raw = snmp.createSession(host, community, opts)

  raw.on('error', () => {
    // Errors propagate through callback — no-op to prevent unhandled
  })

  return {
    raw,
    close() {
      try {
        raw.close()
      } catch {
        // silently ignore close errors
      }
    }
  }
}

/**
 * Walk a subtree, returning all varbinds.
 *
 * The walk starts at `baseOid` and collects every OID lexicographically
 * below it until end-of-MIB-view is reached or an error occurs.
 */
export function walkOid(
  session: SnmpSession,
  baseOid: string,
  maxRepetitions = 20
): Promise<SnmpVarbind[]> {
  return new Promise<SnmpVarbind[]>((resolve, reject) => {
    const results: SnmpVarbind[] = []

    session.raw.walk(baseOid, maxRepetitions, (varbinds: SnmpVarbindRaw[]) => {
      for (const vb of varbinds) {
        if (snmp.isVarbindError(vb)) {
          // Skip individual OID errors during walk
          continue
        }
        // Detect end-of-MIB markers
        if (
          vb.type === snmp.ObjectType.EndOfMibView
          || (typeof vb.value === 'number' && vb.value === snmp.ObjectType.EndOfMibView)
        ) {
          continue
        }
        results.push({
          oid: vb.oid,
          type: vb.type,
          value: vb.value as SnmpVarbind['value']
        })
      }
    }, (error: Error | null) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

/**
 * Get values for one or more OIDs.
 *
 * Use for scalar OIDs (e.g. CPU load, uptime, temperature).
 */
export function getOids(
  session: SnmpSession,
  oids: string[]
): Promise<SnmpVarbind[]> {
  return new Promise<SnmpVarbind[]>((resolve, reject) => {
    session.raw.get(oids, (error: Error | null, varbinds: SnmpVarbindRaw[]) => {
      if (error) {
        reject(error)
        return
      }

      const results: SnmpVarbind[] = []
      for (const vb of varbinds) {
        if (snmp.isVarbindError(vb)) {
          results.push({
            oid: vb.oid,
            type: vb.type,
            value: null,
            endOfMib: true
          })
        } else {
          results.push({
            oid: vb.oid,
            type: vb.type,
            value: vb.value as SnmpVarbind['value']
          })
        }
      }
      resolve(results)
    })
  })
}

/**
 * Get a single scalar OID value. Shorthand for getOids with one OID.
 * Returns null on error/no-instance.
 */
export async function getOid(
  session: SnmpSession,
  oid: string
): Promise<string | number | Buffer | object | null> {
  const results = await getOids(session, [oid])
  return results[0]?.endOfMib ? null : results[0]?.value ?? null
}

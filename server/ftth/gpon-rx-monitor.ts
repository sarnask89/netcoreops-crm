import { and, eq } from 'drizzle-orm'
import { diagnosticRuns } from '../db/schema'
import { db } from '../utils/db'

export interface GponRxThresholds {
  criticalLowDbm: number
  warningLowDbm: number
  warningHighDbm: number
  criticalHighDbm: number
}

export interface GponRxClassification {
  status: 'normal' | 'warning-low' | 'critical-low' | 'warning-high' | 'critical-high' | 'missing'
  severity: 'warning' | 'critical' | null
  valueDbm: number | null
  message: string
}

export interface GponRxAlert {
  equipmentId: string
  equipmentInventoryId: string
  onuId?: string
  oltPort: string
  onuIdentifier: string
  serialNumber?: string | null
  signalRx: string | null
  valueDbm: number | null
  status: GponRxClassification['status']
  severity: NonNullable<GponRxClassification['severity']>
  message: string
}

function envNumber(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function defaultGponRxThresholds(): GponRxThresholds {
  return {
    criticalLowDbm: envNumber('GPON_RX_CRITICAL_LOW_DBM', -27),
    warningLowDbm: envNumber('GPON_RX_WARNING_LOW_DBM', -25),
    warningHighDbm: envNumber('GPON_RX_WARNING_HIGH_DBM', -10),
    criticalHighDbm: envNumber('GPON_RX_CRITICAL_HIGH_DBM', -8)
  }
}

export function parseSignalRxDbm(signalRx?: string | null) {
  if (!signalRx) return null
  const match = signalRx.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  return Number.isFinite(value) ? value : null
}

export function classifyGponRx(signalRx?: string | null, thresholds = defaultGponRxThresholds()): GponRxClassification {
  const valueDbm = parseSignalRxDbm(signalRx)
  if (valueDbm === null) {
    return {
      status: 'missing',
      severity: 'warning',
      valueDbm,
      message: 'Brak odczytu RX dla ONU'
    }
  }

  if (valueDbm < thresholds.criticalLowDbm) {
    return {
      status: 'critical-low',
      severity: 'critical',
      valueDbm,
      message: `RX ${valueDbm} dBm jest poniżej progu ${thresholds.criticalLowDbm} dBm`
    }
  }

  if (valueDbm < thresholds.warningLowDbm) {
    return {
      status: 'warning-low',
      severity: 'warning',
      valueDbm,
      message: `RX ${valueDbm} dBm zbliża się do dolnego progu ${thresholds.criticalLowDbm} dBm`
    }
  }

  if (valueDbm > thresholds.criticalHighDbm) {
    return {
      status: 'critical-high',
      severity: 'critical',
      valueDbm,
      message: `RX ${valueDbm} dBm jest powyżej progu przeciążenia ${thresholds.criticalHighDbm} dBm`
    }
  }

  if (valueDbm > thresholds.warningHighDbm) {
    return {
      status: 'warning-high',
      severity: 'warning',
      valueDbm,
      message: `RX ${valueDbm} dBm zbliża się do progu przeciążenia ${thresholds.criticalHighDbm} dBm`
    }
  }

  return {
    status: 'normal',
    severity: null,
    valueDbm,
    message: `RX ${valueDbm} dBm mieści się w zakresie roboczym`
  }
}

export async function loadRecentGponRxAlerts(limit = 20) {
  const runs = await db.query.diagnosticRuns.findMany({
    where: and(eq(diagnosticRuns.runType, 'gpon-rx-refresh'), eq(diagnosticRuns.success, true)),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: Math.max(limit, 1)
  })

  return runs.flatMap((run) => {
    const result = run.result as { alerts?: GponRxAlert[] }
    return (result.alerts || []).map(alert => ({
      ...alert,
      diagnosticRunId: run.id,
      createdAt: run.createdAt
    }))
  }).slice(0, limit)
}

import { eq } from 'drizzle-orm'
import { automationScripts } from '../db/schema'
import { db } from '../utils/db'

export const GPON_RX_REFRESH_SCRIPT_BODY = String.raw`import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { diagnosticRuns, ftthOlts, networkEquipment } from './server/db/schema'
import { db, pool } from './server/utils/db'
import { getDriverForEquipment } from './server/utils/network-driver-context'
import { syncDasanOnusToFtth } from './server/ftth/import-service'

interface GponRxThresholds {
  criticalLowDbm: number
  warningLowDbm: number
  warningHighDbm: number
  criticalHighDbm: number
}

function envNumber(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function thresholds(): GponRxThresholds {
  return {
    criticalLowDbm: envNumber('GPON_RX_CRITICAL_LOW_DBM', -27),
    warningLowDbm: envNumber('GPON_RX_WARNING_LOW_DBM', -25),
    warningHighDbm: envNumber('GPON_RX_WARNING_HIGH_DBM', -10),
    criticalHighDbm: envNumber('GPON_RX_CRITICAL_HIGH_DBM', -8)
  }
}

function parseSignalRxDbm(signalRx?: string | null) {
  if (!signalRx) return null
  const match = signalRx.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  return Number.isFinite(value) ? value : null
}

function classifyGponRx(signalRx?: string | null, limits = thresholds()) {
  const valueDbm = parseSignalRxDbm(signalRx)
  if (valueDbm === null) {
    return { status: 'missing', severity: 'warning', valueDbm, message: 'Brak odczytu RX dla ONU' }
  }
  if (valueDbm < limits.criticalLowDbm) {
    return {
      status: 'critical-low',
      severity: 'critical',
      valueDbm,
      message: 'RX ' + valueDbm + ' dBm jest poniżej progu ' + limits.criticalLowDbm + ' dBm'
    }
  }
  if (valueDbm < limits.warningLowDbm) {
    return {
      status: 'warning-low',
      severity: 'warning',
      valueDbm,
      message: 'RX ' + valueDbm + ' dBm zbliża się do dolnego progu ' + limits.criticalLowDbm + ' dBm'
    }
  }
  if (valueDbm > limits.criticalHighDbm) {
    return {
      status: 'critical-high',
      severity: 'critical',
      valueDbm,
      message: 'RX ' + valueDbm + ' dBm jest powyżej progu przeciążenia ' + limits.criticalHighDbm + ' dBm'
    }
  }
  if (valueDbm > limits.warningHighDbm) {
    return {
      status: 'warning-high',
      severity: 'warning',
      valueDbm,
      message: 'RX ' + valueDbm + ' dBm zbliża się do progu przeciążenia ' + limits.criticalHighDbm + ' dBm'
    }
  }
  return { status: 'normal', severity: null, valueDbm, message: 'RX ' + valueDbm + ' dBm mieści się w zakresie roboczym' }
}

async function loadDasanOltEquipment(equipmentId?: string) {
  const rows = equipmentId
    ? await db.query.networkEquipment.findMany({
        where: eq(networkEquipment.id, equipmentId),
        with: { managementDriver: true }
      })
    : await db.query.networkEquipment.findMany({
        with: { managementDriver: true },
        orderBy: (table, { asc }) => [asc(table.inventoryId)]
      })

  return rows.filter(row =>
    row.status !== 'ARCHIVED'
    && (row.managementDriver?.code === 'dasan_nos' || row.managementProtocol === 'dasan_nos')
  )
}

async function loadStoredOnusForEquipment(equipmentId: string) {
  const olt = await db.query.ftthOlts.findFirst({
    where: eq(ftthOlts.networkEquipmentId, equipmentId),
    with: {
      ponPorts: {
        with: {
          onus: true
        }
      }
    }
  })

  return olt?.ponPorts.flatMap(port => port.onus.map(onu => ({
    ...onu,
    oltPort: port.portCode
  }))) || []
}

function buildAlerts(equipmentId: string, equipmentInventoryId: string, onus: Awaited<ReturnType<typeof loadStoredOnusForEquipment>>, limits: GponRxThresholds) {
  const alerts = []
  for (const onu of onus) {
    if (onu.status.toLowerCase() !== 'active') continue
    const classification = classifyGponRx(onu.signalRx, limits)
    if (!classification.severity) continue
    alerts.push({
      equipmentId,
      equipmentInventoryId,
      onuId: onu.id,
      oltPort: onu.oltPort,
      onuIdentifier: onu.onuIdentifier,
      serialNumber: onu.serialNumber,
      signalRx: onu.signalRx,
      valueDbm: classification.valueDbm,
      status: classification.status,
      severity: classification.severity,
      message: equipmentInventoryId + ' PON ' + onu.oltPort + ' ONU ' + onu.onuIdentifier + ': ' + classification.message
    })
  }
  return alerts
}

async function runGponRxRefresh() {
  const equipmentId = process.env.NETCOREOPS_AUTOMATION_EQUIPMENT_ID || process.argv.find(arg => arg.startsWith('--equipment-id='))?.split('=')[1]
  const limits = thresholds()
  const equipmentRows = await loadDasanOltEquipment(equipmentId)
  const result = {
    thresholds: limits,
    equipmentScanned: 0,
    onusScanned: 0,
    alerts: [],
    runs: []
  }

  for (const equipment of equipmentRows) {
    const { driver, driverCode } = await getDriverForEquipment(equipment.id)
    const onus = await driver.getOnus({ activeOnly: true })
    await syncDasanOnusToFtth(equipment.id, onus, 'apply')
    const storedOnus = await loadStoredOnusForEquipment(equipment.id)
    const alerts = buildAlerts(equipment.id, equipment.inventoryId, storedOnus, limits)

    result.equipmentScanned += 1
    result.onusScanned += onus.length
    result.alerts.push(...alerts)
    result.runs.push({
      equipmentId: equipment.id,
      equipmentInventoryId: equipment.inventoryId,
      driverCode,
      onusScanned: onus.length,
      alerts: alerts.length
    })

    await db.insert(diagnosticRuns).values({
      equipmentId: equipment.id,
      driverCode,
      runType: 'gpon-rx-refresh',
      target: equipment.inventoryId,
      success: true,
      result: {
        thresholds: limits,
        onusScanned: onus.length,
        alerts,
        alertCount: alerts.length
      }
    })
  }

  return result
}

runGponRxRefresh()
  .then(async (result) => {
    console.log(JSON.stringify({ ok: true, ...result }, null, 2))
    await pool.end()
  })
  .catch(async (error) => {
    console.error(error)
    await pool.end()
    process.exit(1)
  })
`

export async function registerGponRxAutomationScript(equipmentId?: string | null) {
  const existing = await db.query.automationScripts.findFirst({
    where: eq(automationScripts.name, 'GPON RX refresh 30m')
  })
  const values = {
    scope: 'DEVICE',
    triggerType: 'SCHEDULED_30_MIN',
    scriptLanguage: 'typescript',
    scriptBody: GPON_RX_REFRESH_SCRIPT_BODY,
    equipmentId: equipmentId || null,
    isEnabled: true,
    timeoutSeconds: 900
  }

  if (existing) {
    const [updated] = await db.update(automationScripts)
      .set(values)
      .where(eq(automationScripts.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(automationScripts)
    .values({ name: 'GPON RX refresh 30m', ...values })
    .returning()
  return created
}

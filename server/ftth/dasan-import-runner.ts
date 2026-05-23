import type { DriverMacTableEntry, DriverOnuIpHost, NetworkManagementDriver } from '../network-drivers/types'
import type { ImportMode } from '../utils/import-actions'
import { compactImportSummary, recordImportRun } from '../utils/import-actions'
import { loadKnownFtthOnus, syncDasanMacMapToFtth, syncDasanOnuIpHostsToFtth } from './import-service'

export interface DasanImportProgress {
  activeOnly: boolean
  totalKnownOnus: number
  selectedOnus: number
  processedOnus: number
  rangeFrom?: number
  rangeTo?: number
  ipHosts?: number
  macRows?: number
  completed: boolean
  currentOnu?: string | null
}

export type DasanImportResult = Record<string, unknown> & {
  progress: DasanImportProgress
}

export type DasanImportProgressCallback = (progress: DasanImportProgress) => void

export interface DasanImportRunnerOptions {
  equipmentId: string
  mode: ImportMode
  activeOnly: boolean
  limit?: number
  rangeFrom?: number
  rangeTo?: number
  driver: NetworkManagementDriver
  driverCode: string
  onProgress?: DasanImportProgressCallback
}

function effectiveImportMode(mode: ImportMode): ImportMode {
  return mode === 'dryRun' ? 'preview' : mode
}

function onuLabel(oltPort: string, onuId: string) {
  return `${oltPort}/${onuId}`
}

function numericPart(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

function sortOnus(allOnus: Awaited<ReturnType<typeof loadKnownFtthOnus>>) {
  return [...allOnus].sort((left, right) => {
    const portDiff = numericPart(left.oltPort) - numericPart(right.oltPort)
    if (portDiff) return portDiff
    const onuDiff = numericPart(left.onuId) - numericPart(right.onuId)
    if (onuDiff) return onuDiff
    return `${left.oltPort}:${left.onuId}`.localeCompare(`${right.oltPort}:${right.onuId}`)
  })
}

export function selectDasanImportOnus(allOnus: Awaited<ReturnType<typeof loadKnownFtthOnus>>, options: Pick<DasanImportRunnerOptions, 'activeOnly' | 'limit' | 'rangeFrom' | 'rangeTo'>) {
  const filtered = sortOnus(options.activeOnly ? allOnus.filter(onu => onu.status?.toLowerCase() === 'active') : allOnus)
  if (options.rangeFrom || options.rangeTo) {
    const start = Math.max((options.rangeFrom || 1) - 1, 0)
    const end = Math.max(options.rangeTo || filtered.length, start)
    return filtered.slice(start, end)
  }

  return filtered.slice(0, options.limit)
}

export async function runDasanIpHostsImport(options: DasanImportRunnerOptions): Promise<DasanImportResult> {
  const effectiveMode = effectiveImportMode(options.mode)
  const allOnus = await loadKnownFtthOnus(options.equipmentId)
  const onus = selectDasanImportOnus(allOnus, options)
  const ipHosts: DriverOnuIpHost[] = []
  const progress: DasanImportProgress = {
    activeOnly: options.activeOnly,
    totalKnownOnus: allOnus.length,
    selectedOnus: onus.length,
    processedOnus: 0,
    rangeFrom: options.rangeFrom,
    rangeTo: options.rangeTo,
    ipHosts: 0,
    completed: false,
    currentOnu: null
  }

  options.onProgress?.({ ...progress })

  for (const onu of onus) {
    progress.currentOnu = onuLabel(onu.oltPort, onu.onuId)
    options.onProgress?.({ ...progress })

    if (onu.oltPort && onu.onuId) {
      ipHosts.push(...await options.driver.getOnuIpHosts(onu.oltPort, onu.onuId))
      progress.ipHosts = ipHosts.length
    }

    progress.processedOnus += 1
    options.onProgress?.({ ...progress })
  }

  const actions = await syncDasanOnuIpHostsToFtth(options.equipmentId, ipHosts, effectiveMode)
  const summary = compactImportSummary({ mode: effectiveMode, macs: ipHosts.length, actions }) as Record<string, unknown>
  const data = {
    ...summary,
    progress: {
      ...progress,
      ipHosts: ipHosts.length,
      completed: true,
      currentOnu: null
    }
  }

  await recordImportRun(options.equipmentId, options.driverCode, 'dasan-ip-hosts', effectiveMode, data)

  return data
}

export async function runDasanMacMapImport(options: DasanImportRunnerOptions): Promise<DasanImportResult> {
  const effectiveMode = effectiveImportMode(options.mode)
  const allOnus = await loadKnownFtthOnus(options.equipmentId)
  const onus = selectDasanImportOnus(allOnus, options)
  const macTables: DriverMacTableEntry[] = []
  const progress: DasanImportProgress = {
    activeOnly: options.activeOnly,
    totalKnownOnus: allOnus.length,
    selectedOnus: onus.length,
    processedOnus: 0,
    rangeFrom: options.rangeFrom,
    rangeTo: options.rangeTo,
    macRows: 0,
    completed: false,
    currentOnu: null
  }

  options.onProgress?.({ ...progress })

  for (const onu of onus) {
    progress.currentOnu = onuLabel(onu.oltPort, onu.onuId)
    options.onProgress?.({ ...progress })

    if (onu.oltPort && onu.onuId) {
      macTables.push(...await options.driver.getOnuMacTable(onu.oltPort, onu.onuId))
      progress.macRows = macTables.length
    }

    progress.processedOnus += 1
    options.onProgress?.({ ...progress })
  }

  const actions = await syncDasanMacMapToFtth(options.equipmentId, macTables, effectiveMode)
  const summary = compactImportSummary({ mode: effectiveMode, macs: macTables.length, actions }) as Record<string, unknown>
  const data = {
    ...summary,
    progress: {
      ...progress,
      macRows: macTables.length,
      completed: true,
      currentOnu: null
    }
  }

  await recordImportRun(options.equipmentId, options.driverCode, 'dasan-mac-map', effectiveMode, data)

  return data
}

export type NetflowInterfaceRole = 'dhcp' | 'uplink' | 'unknown'

export interface NetflowInterfaceRoleConfig {
  name: string
  role: NetflowInterfaceRole
  sourceInterface?: string
  speedBps?: number
}

interface NetflowDiagnosticRun {
  equipmentId: string | null
  runType: string
  result: unknown
}

interface NetflowEquipmentRow {
  id: string
  managementIp: string | null
  hostname: string | null
}

interface RouterOsRow {
  [key: string]: unknown
}

interface DiagnosticResult {
  data?: {
    interfaceRoles?: DiagnosticInterfaceRole[]
    raw?: {
      routerInterfaces?: RouterOsRow[]
      dhcpServers?: RouterOsRow[]
    }
  }
}

interface DiagnosticInterfaceRole {
  name?: string
  role?: 'dhcp' | 'uplink'
  sourceInterface?: string
  ifIndex?: number
  speedBps?: number
}

function rowString(row: RouterOsRow, key: string) {
  const value = row[key]
  return typeof value === 'string' ? value.trim() : ''
}

function isEnabled(row: RouterOsRow) {
  const disabled = rowString(row, 'disabled').toLowerCase()
  return disabled !== 'true' && disabled !== 'yes'
}

export function routerOsIdToIfIndex(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('*')) return undefined
  const parsed = Number.parseInt(value.slice(1), 16)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toOptionalNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function setIfMissing(
  roleMap: Map<number, NetflowInterfaceRoleConfig>,
  ifIndex: number | undefined,
  config: NetflowInterfaceRoleConfig
) {
  if (typeof ifIndex !== 'number') return
  if (!roleMap.has(ifIndex)) roleMap.set(ifIndex, config)
}

function rawInterfaceIndexes(rows: RouterOsRow[] | undefined) {
  const indexes = new Map<string, number>()
  for (const row of rows || []) {
    const name = rowString(row, 'name')
    const ifIndex = routerOsIdToIfIndex(rowString(row, '.id'))
    if (name && typeof ifIndex === 'number') indexes.set(name, ifIndex)
  }
  return indexes
}

function sumSourceSpeeds(interfaceRoles: DiagnosticInterfaceRole[], sourceInterface: string) {
  const speed = (interfaceRoles || [])
    .filter(role => role.sourceInterface === sourceInterface)
    .reduce((sum, role) => sum + (toOptionalNumber(role.speedBps) || 0), 0)
  return speed > 0 ? speed : undefined
}

export function buildNetflowInterfaceRoleMaps(
  diagnosticRows: NetflowDiagnosticRun[],
  equipmentRows: NetflowEquipmentRow[]
) {
  const equipmentIpById = new Map(equipmentRows.map(row => [row.id, row.managementIp || row.hostname || 'unknown']))
  const rolesByExporter = new Map<string, Map<number, NetflowInterfaceRoleConfig>>()

  for (const run of diagnosticRows) {
    if (run.runType !== 'netflow-config' || !run.equipmentId) continue
    const exporter = equipmentIpById.get(run.equipmentId)
    if (!exporter) continue

    const result = run.result as DiagnosticResult
    const roleMap = rolesByExporter.get(exporter) || new Map<number, NetflowInterfaceRoleConfig>()
    const interfaceIndexes = rawInterfaceIndexes(result.data?.raw?.routerInterfaces)
    const interfaceRoles = result.data?.interfaceRoles || []

    for (const role of interfaceRoles) {
      if (!role.name || !role.role) continue
      setIfMissing(roleMap, role.ifIndex, {
        name: role.name,
        role: role.role,
        sourceInterface: role.sourceInterface,
        speedBps: toOptionalNumber(role.speedBps)
      })
    }

    for (const server of result.data?.raw?.dhcpServers || []) {
      if (!isEnabled(server)) continue
      const name = rowString(server, 'interface')
      setIfMissing(roleMap, interfaceIndexes.get(name), {
        name,
        role: 'dhcp',
        speedBps: sumSourceSpeeds(interfaceRoles, name)
      })
    }

    for (const [name, ifIndex] of interfaceIndexes) {
      setIfMissing(roleMap, ifIndex, { name, role: 'unknown' })
    }

    rolesByExporter.set(exporter, roleMap)
  }

  return rolesByExporter
}

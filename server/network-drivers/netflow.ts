export interface NetflowCollector {
  address: string
  port: number
  version: 9 | 'ipfix'
}

export interface NetflowInterfacePlan {
  dhcpServerInterfaces: string[]
  dhcpInterfaces: string[]
  uplinkInterfaces: string[]
  interfaces: string[]
  roleSources: Array<{
    name: string
    role: 'dhcp' | 'uplink'
    sourceInterface?: string
  }>
}

interface RouterOsRow {
  [key: string]: unknown
}

function rowString(row: RouterOsRow, key: string) {
  const value = row[key]
  return typeof value === 'string' ? value.trim() : ''
}

function isEnabled(row: RouterOsRow) {
  const disabled = rowString(row, 'disabled').toLowerCase()
  return disabled !== 'true' && disabled !== 'yes'
}

function isActive(row: RouterOsRow) {
  const active = rowString(row, 'active').toLowerCase()
  const flags = rowString(row, 'flags').toUpperCase()
  return active === 'true' || active === 'yes' || flags.includes('A') || (!active && !flags.includes('I'))
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

function isIpAddressLike(value: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) || value.includes(':')
}

export function parseNetflowCollector(value: string | undefined | null): NetflowCollector {
  const input = (value || '').trim()
  const match = input.match(/^(.+):(\d{1,5})$/)
  if (!match) throw new Error('Collector NetFlow musi mieć format IP:PORT, np. 10.0.222.226:2055')

  const port = Number(match[2])
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Port collectora NetFlow musi być z zakresu 1-65535')
  }

  return { address: match[1]!.trim(), port, version: 'ipfix' }
}

export function extractDhcpInterfaces(rows: RouterOsRow[]) {
  return unique(rows
    .filter(isEnabled)
    .map(row => rowString(row, 'interface')))
}

export function extractBridgePorts(rows: RouterOsRow[], bridgeNames: string[]) {
  const bridges = new Set(bridgeNames)
  const portsByBridge = new Map<string, string[]>()

  for (const row of rows.filter(isEnabled)) {
    const bridge = rowString(row, 'bridge')
    const port = rowString(row, 'interface')
    if (!bridge || !port || !bridges.has(bridge)) continue
    portsByBridge.set(bridge, unique([...(portsByBridge.get(bridge) || []), port]))
  }

  return portsByBridge
}

export function extractBridgePortInterfaces(rows: RouterOsRow[]) {
  const portsByBridge = new Map<string, string[]>()

  for (const row of rows.filter(isEnabled)) {
    const bridge = rowString(row, 'bridge')
    const port = rowString(row, 'interface')
    if (!bridge || !port) continue
    portsByBridge.set(bridge, unique([...(portsByBridge.get(bridge) || []), port]))
  }

  return portsByBridge
}

export function extractDefaultGatewayInterfaces(rows: RouterOsRow[]) {
  const interfaces: string[] = []

  for (const row of rows) {
    const destination = rowString(row, 'dst-address')
    if (destination && destination !== '0.0.0.0/0' && destination !== '::/0') continue
    if (!isActive(row)) continue

    const immediateGateway = rowString(row, 'immediate-gw')
    const immediateInterface = immediateGateway.includes('%') ? immediateGateway.split('%').pop() : ''
    if (immediateInterface) interfaces.push(immediateInterface)

    const gateway = rowString(row, 'gateway')
    if (gateway && !isIpAddressLike(gateway)) interfaces.push(gateway)

    const gatewayStatus = rowString(row, 'gateway-status')
    const statusInterface = gatewayStatus.match(/\bvia\s+([^\s,]+)/i)?.[1]
    if (statusInterface) interfaces.push(statusInterface)
  }

  return unique(interfaces)
}

export function extractVlanParentInterfaces(rows: RouterOsRow[], interfaceNamesById = new Map<string, string>()) {
  const parents = new Map<string, string>()

  for (const row of rows.filter(isEnabled)) {
    const name = rowString(row, 'name')
    const rawParentInterface = rowString(row, 'interface')
    const parentInterface = interfaceNamesById.get(rawParentInterface) || rawParentInterface
    if (!name || !parentInterface) continue
    parents.set(name, parentInterface)
  }

  return parents
}

export function resolveInterfaceSpeedBps(
  interfaceName: string,
  directSpeedsByName: Map<string, number>,
  parentInterfacesByName: Map<string, string>,
  childInterfacesByName = new Map<string, string[]>(),
  visited = new Set<string>()
): number | undefined {
  const directSpeed = directSpeedsByName.get(interfaceName)
  if (typeof directSpeed === 'number') return directSpeed
  if (visited.has(interfaceName)) return undefined

  const nextVisited = new Set([...visited, interfaceName])
  const childSpeeds = (childInterfacesByName.get(interfaceName) || [])
    .map(childInterface => resolveInterfaceSpeedBps(
      childInterface,
      directSpeedsByName,
      parentInterfacesByName,
      childInterfacesByName,
      nextVisited
    ))
    .filter((speed): speed is number => typeof speed === 'number')
  if (childSpeeds.length) return childSpeeds.reduce((sum, speed) => sum + speed, 0)

  const parentInterface = parentInterfacesByName.get(interfaceName)
  if (!parentInterface) return undefined

  return resolveInterfaceSpeedBps(
    parentInterface,
    directSpeedsByName,
    parentInterfacesByName,
    childInterfacesByName,
    nextVisited
  )
}

export function buildNetflowInterfacePlan(input: { dhcpServers: RouterOsRow[], routes: RouterOsRow[], bridgePorts?: RouterOsRow[] }): NetflowInterfacePlan {
  const dhcpServerInterfaces = extractDhcpInterfaces(input.dhcpServers)
  const bridgePortsByBridge = extractBridgePorts(input.bridgePorts || [], dhcpServerInterfaces)
  const dhcpRoles = dhcpServerInterfaces.flatMap((dhcpInterface) => {
    const bridgePorts = bridgePortsByBridge.get(dhcpInterface) || []
    if (!bridgePorts.length) return [{ name: dhcpInterface, role: 'dhcp' as const }]
    return bridgePorts.map(name => ({ name, role: 'dhcp' as const, sourceInterface: dhcpInterface }))
  })
  const dhcpInterfaces = unique(dhcpRoles.map(role => role.name))
  const uplinkInterfaces = extractDefaultGatewayInterfaces(input.routes)
  const uplinkRoles = uplinkInterfaces.map(name => ({ name, role: 'uplink' as const }))
  const roleSources = [...dhcpRoles, ...uplinkRoles]

  return {
    dhcpServerInterfaces,
    dhcpInterfaces,
    uplinkInterfaces,
    interfaces: unique(roleSources.map(role => role.name)),
    roleSources
  }
}

export function parseInterfaceSpeedBps(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '')
  const match = normalized.match(/^(\d+(?:\.\d+)?)(t|g|m|k)?(?:bit\/s|bps|b)?(?:-.+)?$/)
  if (!match) return undefined

  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  const unit = match[2] || ''
  const multiplier = unit === 't'
    ? 1_000_000_000_000
    : unit === 'g'
      ? 1_000_000_000
      : unit === 'm'
        ? 1_000_000
        : unit === 'k'
          ? 1_000
          : 1

  return Math.round(amount * multiplier)
}

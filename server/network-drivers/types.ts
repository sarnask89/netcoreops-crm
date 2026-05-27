export interface DriverAccessProfile {
  defaultPort?: number | null
  username?: string | null
  passwordEncrypted?: string | null
  snmpCommunityEncrypted?: string | null
  apiBaseUrl?: string | null
  apiTokenEncrypted?: string | null
  sshKeyEncrypted?: string | null
  extraConfig?: unknown
}

export interface DriverEquipment {
  id: string
  inventoryId: string
  hostname?: string | null
  managementIp?: string | null
  managementPort?: number | null
  managementProtocol?: string | null
  macAddress?: string | null
  serialNumber?: string | null
  onuPort?: string | null
  onuId?: string | null
  accessProfile?: DriverAccessProfile | null
}

export interface DriverCheckResult {
  name: string
  status: 'ok' | 'warning' | 'error' | 'unsupported'
  data?: unknown
  message?: string
}

export interface DriverLease {
  id?: string
  address?: string
  macAddress?: string
  comment?: string
  rateLimit?: string
  status?: string
  disabled?: boolean
  blocked?: boolean
  server?: string
  serverInterface?: string
  interface?: string
  raw?: unknown
}

export interface DriverNetwork {
  cidr: string
  gateway?: string | null
  comment?: string | null
  raw?: unknown
}

export interface DriverActiveUser {
  macAddress: string
  ipAddress: string
  server?: string
  serverInterface?: string
  evidence: Array<'arp' | 'bridge-host' | 'switch-fdb'>
}

export interface DriverActiveUsersSnapshot {
  totalLeases: number
  candidateLeases: number
  activeUsers: DriverActiveUser[]
  evidenceCounts: {
    arp: number
    bridgeHost: number
    switchFdb: number
  }
}

export interface DriverNetflowConfig {
  collector: string
  version?: 9 | 'ipfix'
}

export interface DriverNetflowResult {
  collector: {
    address: string
    port: number
    version: 9 | 'ipfix'
  }
  dhcpServerInterfaces: string[]
  dhcpInterfaces: string[]
  uplinkInterfaces: string[]
  interfaces: string[]
  interfaceRoles?: Array<{
    name: string
    role: 'dhcp' | 'uplink'
    sourceInterface?: string
    routerOsId?: string
    ifIndex?: number
    speedBps?: number
  }>
  targetAction: 'created' | 'updated' | 'unchanged'
  staleTargetsDisabled?: string[]
  raw?: unknown
}

export interface DriverOnu {
  oltPort: string
  onuId: string
  status: string
  serialNumber?: string
  uptime?: string
  signalRx?: string
}

export interface DriverOnuScanOptions {
  activeOnly?: boolean
  limit?: number
  rangeFrom?: number
  rangeTo?: number
}

export interface DriverMacTableEntry {
  oltPort?: string
  onuId?: string
  port?: string
  macAddress: string
  gemId?: string
  vlanId?: string
  status?: string
}

export interface DriverOnuIpHost {
  oltPort: string
  onuId: string
  hostId: string
  ipOption?: string
  macAddress?: string
  currentIp?: string
  currentMask?: string
  currentGateway?: string
  primaryDns?: string
  secondaryDns?: string
  domainName?: string
  hostName?: string
}

export interface DriverOnuDetails {
  status?: string
  serialNumber?: string
  uptime?: string
  signalRx?: string
  ipHosts?: DriverOnuIpHost[]
  raw?: unknown
}

export interface UpsertLeasePayload {
  macAddress: string
  ipAddress: string
  comment?: string
  rateLimit?: string
}

export interface NetworkManagementDriver {
  code: string
  ping(target: string): Promise<DriverCheckResult>
  arpPing(target: string): Promise<DriverCheckResult>
  getDhcpLease(macAddress: string): Promise<DriverCheckResult>
  getBridgeHost(macAddress: string): Promise<DriverCheckResult>
  getSwitchFdb(macAddress: string): Promise<DriverCheckResult>
  getLeases(): Promise<DriverLease[]>
  getActiveUsers(): Promise<DriverActiveUsersSnapshot>
  getNetworks(): Promise<DriverNetwork[]>
  getOnus(options?: DriverOnuScanOptions): Promise<DriverOnu[]>
  getOnuInfo(oltPort: string, onuId: string): Promise<DriverCheckResult>
  getOltMacTable(oltPort: string): Promise<DriverMacTableEntry[]>
  getOnuMacTable(oltPort: string, onuId: string): Promise<DriverMacTableEntry[]>
  getOnuIpHosts(oltPort: string, onuId: string): Promise<DriverOnuIpHost[]>
  upsertDhcpLease(payload: UpsertLeasePayload): Promise<DriverCheckResult>
  configureNetflow(config: DriverNetflowConfig): Promise<DriverCheckResult>
  getCommandTree(): Promise<DriverCheckResult>
}

export function unsupportedCheck(name: string): DriverCheckResult {
  return { name, status: 'unsupported', message: 'Driver nie wspiera tej operacji' }
}

import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: {
    name: string
    email?: string
    avatar?: AvatarProps
  }
  body: string
  date: string
}

export interface DashboardAlert {
  equipmentId: string
  equipmentInventoryId: string
  onuId?: string
  oltPort: string
  onuIdentifier: string
  serialNumber?: string | null
  signalRx: string | null
  valueDbm: number | null
  status: string
  severity: 'warning' | 'critical'
  message: string
  diagnosticRunId?: string
  createdAt: string
}

export interface DashboardTelemetryPoint {
  timestamp: string
  snmpSamples: number
  netflowSamples: number
  alerts: number
}

export interface DashboardNetflowInterfacePoint {
  timestamp: string
  exporterAddress: string
  interfaceName: string
  role: 'dhcp' | 'uplink' | 'unknown'
  sourceInterface?: string
  speedBps?: number
  direction: 'input' | 'output'
  bytes: number
  bps: number
  utilizationPct: number | null
  packets: number
  records: number
  samples: number
}

export interface DashboardActiveUsersPoint {
  timestamp: string
  scope: 'total' | 'equipment' | 'dhcp-server' | 'interface'
  key: string
  label: string
  count: number
  joined: number
  left: number
}

export interface DashboardCollectorHealthPoint {
  exporterAddress: string
  version: number
  sourceId: number
  packetCount: number
  flowRecords: number
  unknownTemplateRecords: number
  sequenceGaps: number
  templatesRefreshed: number
  lastSequence: number
  lastPacketAt: string
  updatedAt: string
}

export interface DashboardTopUserPoint {
  userKey: string
  label: string
  customerDeviceId?: string | null
  customerId?: string | null
  localIp?: string | null
  downloadBps: number
  uploadBps: number
  totalBytes: number
  flows: number
}

export interface SnmpQueuePoint {
  timestamp: string
  equipmentId: string
  queueName: string
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  droppedIn: number
  droppedOut: number
  pcqQueuesIn: number
  pcqQueuesOut: number
}

export interface SnmpSystemPoint {
  timestamp: string
  equipmentId: string
  cpuLoad: number | null
  temperature: number | null
  totalMemory: number | null
  freeMemory: number | null
  boardName: string | null
  version: string | null
}

export interface DashboardSummary {
  counters: {
    customers: number
    customerDevices: number
    equipment: number
    nodes: number
    lines: number
    onus: number
    activeOnus: number
    gponAlerts: number
  }
  alerts: DashboardAlert[]
  telemetry: DashboardTelemetryPoint[]
  netflowInterfaces: DashboardNetflowInterfacePoint[]
  activeUsers: DashboardActiveUsersPoint[]
  collectorHealth: DashboardCollectorHealthPoint[]
  topUsers: DashboardTopUserPoint[]
  snmpQueues: SnmpQueuePoint[]
  snmpSystem: SnmpSystemPoint[]
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

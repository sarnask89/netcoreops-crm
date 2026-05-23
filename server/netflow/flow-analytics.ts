import type { NetflowFlowRecord } from './collector'

export type FlowDirection = 'download' | 'upload' | 'local' | 'unknown'
export type FlowConfidence = 'mac' | 'lease-ip' | 'network-only' | 'unknown'

export interface FlowDeviceRef {
  id: string
  customerId: string | null
  hostname: string
  ipAddress: string | null
  macAddress: string | null
}

export interface FlowEnrichmentContext {
  localNetworks: string[]
  devices: FlowDeviceRef[]
}

export interface EnrichedFlowRecord extends NetflowFlowRecord {
  direction: FlowDirection
  localIp: string | null
  remoteIp: string | null
  userKey: string
  customerDeviceId: string | null
  customerId: string | null
  confidence: FlowConfidence
}

export interface FlowInterfaceRollup {
  bucket: string
  exporterAddress: string
  ifIndex: number
  direction: 'input' | 'output'
  bytes: number
  packets: number
  flows: number
  bps: number
}

export interface FlowUserRollup {
  bucket: string
  exporterAddress: string
  userKey: string
  customerDeviceId: string | null
  customerId: string | null
  localIp: string | null
  direction: FlowDirection
  bytes: number
  packets: number
  flows: number
  bps: number
}

function normalizeMac(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null
}

function ipv4ToInt(value: string | null | undefined) {
  if (!value) return null
  const parts = value.split('.').map(part => Number(part))
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return null
  return (((parts[0]! << 24) >>> 0) + (parts[1]! << 16) + (parts[2]! << 8) + parts[3]!) >>> 0
}

function cidrContains(cidr: string, ip: string | null | undefined) {
  const [network, prefixValue] = cidr.split('/')
  const networkInt = ipv4ToInt(network)
  const ipInt = ipv4ToInt(ip)
  const prefix = Number(prefixValue)
  if (networkInt === null || ipInt === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (networkInt & mask) === (ipInt & mask)
}

function isLocalIp(ip: string | null | undefined, networks: string[]) {
  return networks.some(cidr => cidrContains(cidr, ip))
}

function bucketTimestamp(timestamp: string, bucketSeconds: number) {
  const date = new Date(timestamp)
  const bucketMs = bucketSeconds * 1000
  return new Date(Math.floor(date.getTime() / bucketMs) * bucketMs).toISOString()
}

function indexDevices(devices: FlowDeviceRef[]) {
  const byMac = new Map<string, FlowDeviceRef>()
  const byIp = new Map<string, FlowDeviceRef>()
  for (const device of devices) {
    const mac = normalizeMac(device.macAddress)
    if (mac) byMac.set(mac, device)
    if (device.ipAddress) byIp.set(device.ipAddress, device)
  }
  return { byMac, byIp }
}

export function enrichFlowRecord(record: NetflowFlowRecord, context: FlowEnrichmentContext): EnrichedFlowRecord {
  const srcLocal = isLocalIp(record.srcIp, context.localNetworks)
  const dstLocal = isLocalIp(record.dstIp, context.localNetworks)
  const direction: FlowDirection = srcLocal && dstLocal
    ? 'local'
    : srcLocal
      ? 'upload'
      : dstLocal
        ? 'download'
        : 'unknown'
  const localIp = srcLocal ? record.srcIp : dstLocal ? record.dstIp : null
  const remoteIp = srcLocal ? record.dstIp : dstLocal ? record.srcIp : null
  const { byMac, byIp } = indexDevices(context.devices)
  const deviceByMac = byMac.get(normalizeMac(record.srcMac) || '') || byMac.get(normalizeMac(record.dstMac) || '')
  const deviceByIp = localIp ? byIp.get(localIp) : undefined
  const device = deviceByMac || deviceByIp
  const confidence: FlowConfidence = deviceByMac
    ? 'mac'
    : deviceByIp
      ? 'lease-ip'
      : localIp
        ? 'network-only'
        : 'unknown'

  return {
    ...record,
    direction,
    localIp,
    remoteIp,
    userKey: device ? `device:${device.id}` : localIp ? `ip:${localIp}` : 'unknown',
    customerDeviceId: device?.id || null,
    customerId: device?.customerId || null,
    confidence
  }
}

function upsertInterfaceRollup(map: Map<string, FlowInterfaceRollup>, input: {
  bucket: string
  exporterAddress: string
  ifIndex: number | null
  direction: 'input' | 'output'
  bytes: number
  packets: number
}, bucketSeconds: number) {
  if (!input.ifIndex) return
  const key = `${input.bucket}|${input.exporterAddress}|${input.ifIndex}|${input.direction}`
  const row = map.get(key) || {
    bucket: input.bucket,
    exporterAddress: input.exporterAddress,
    ifIndex: input.ifIndex,
    direction: input.direction,
    bytes: 0,
    packets: 0,
    flows: 0,
    bps: 0
  }
  row.bytes += input.bytes
  row.packets += input.packets
  row.flows += 1
  row.bps = (row.bytes * 8) / bucketSeconds
  map.set(key, row)
}

export function aggregateFlowRecords(records: EnrichedFlowRecord[], bucketSeconds: number) {
  const interfaceRollups = new Map<string, FlowInterfaceRollup>()
  const userRollups = new Map<string, FlowUserRollup>()

  for (const record of records) {
    const bucket = bucketTimestamp(record.lastSeenAt || record.exportedAt, bucketSeconds)
    upsertInterfaceRollup(interfaceRollups, {
      bucket,
      exporterAddress: record.exporterAddress,
      ifIndex: record.inputIfIndex,
      direction: 'input',
      bytes: record.bytes,
      packets: record.packets
    }, bucketSeconds)
    upsertInterfaceRollup(interfaceRollups, {
      bucket,
      exporterAddress: record.exporterAddress,
      ifIndex: record.outputIfIndex,
      direction: 'output',
      bytes: record.bytes,
      packets: record.packets
    }, bucketSeconds)

    if (record.direction === 'unknown') continue
    const userKey = `${bucket}|${record.exporterAddress}|${record.userKey}|${record.direction}`
    const userRow = userRollups.get(userKey) || {
      bucket,
      exporterAddress: record.exporterAddress,
      userKey: record.userKey,
      customerDeviceId: record.customerDeviceId,
      customerId: record.customerId,
      localIp: record.localIp,
      direction: record.direction,
      bytes: 0,
      packets: 0,
      flows: 0,
      bps: 0
    }
    userRow.bytes += record.bytes
    userRow.packets += record.packets
    userRow.flows += 1
    userRow.bps = (userRow.bytes * 8) / bucketSeconds
    userRollups.set(userKey, userRow)
  }

  return {
    interfaceRollups: Array.from(interfaceRollups.values()),
    userRollups: Array.from(userRollups.values())
  }
}

export interface DasanOnuActiveRow {
  oltPort: string
  onuId: string
  status: string
  serialNumber: string
  uptime?: string
}

export interface DasanMacTableRow {
  oltPort?: string
  onuId?: string
  port?: string
  macAddress: string
  gemId?: string
  vlanId: string
  status: string
}

export interface DasanRxPowerRow {
  oltPort: string
  onuId: string
  signalRx: string
}

export interface DasanOnuIpHostRow {
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

function normalizeDasanNumericId(value: string) {
  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isFinite(parsed) ? String(parsed) : value.trim()
}

export function parseDasanOnuActive(raw: string): DasanOnuActiveRow[] {
  const rows: DasanOnuActiveRow[] = []

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\w+)\s*\|\s*\w+\s*\|\s*(\w+)(?:\s*\|[^\n|]*)?(?:\|\s*([0-9:]+))?/)
    if (!match) continue
    const [, oltPort, onuId, status, serialNumber, uptime] = match
    if (!oltPort || !onuId || !status || !serialNumber) continue

    rows.push({
      oltPort: normalizeDasanNumericId(oltPort),
      onuId: normalizeDasanNumericId(onuId),
      status,
      serialNumber,
      uptime
    })
  }

  return rows
}

export function parseDasanMacTable(raw: string): DasanMacTableRow[] {
  const rows: DasanMacTableRow[] = []
  const isUsableMac = (macAddress: string) => macAddress.toLowerCase() !== '00:00:00:00:00:00'

  for (const line of raw.split(/\r?\n/)) {
    const oltMatch = line.match(/^\s*\d+\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([0-9a-fA-F:]{17})\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\w+)/)
    if (oltMatch) {
      const [, oltPort, onuId, macAddress, gemId, vlanId, status] = oltMatch
      if (!oltPort || !onuId || !macAddress || !gemId || !vlanId || !status || !isUsableMac(macAddress)) continue
      rows.push({
        oltPort,
        onuId,
        macAddress: macAddress.toLowerCase(),
        gemId,
        vlanId,
        status
      })
      continue
    }

    const bridgeMatch = line.match(/^\s*(\d+)\s+([a-zA-Z0-9/]+)\s+([0-9a-fA-F:]{17})(?:\s+\w+)?(?:\s+(\w+))?/)
    if (bridgeMatch) {
      const [, vlanId, port, macAddress, status] = bridgeMatch
      if (!vlanId || !port || !macAddress || !isUsableMac(macAddress)) continue
      rows.push({
        port,
        macAddress: macAddress.toLowerCase(),
        vlanId,
        status: status || 'dynamic'
      })
    }
  }

  return rows
}

export function parseDasanRxPower(raw: string): DasanRxPowerRow[] {
  const rows = new Map<string, DasanRxPowerRow>()
  let currentOltPort: string | null = null
  let currentOnuId: string | null = null

  const addRow = (oltPort: string, onuId: string, signalRx: string) => {
    const row = {
      oltPort: normalizeDasanNumericId(oltPort),
      onuId: normalizeDasanNumericId(onuId),
      signalRx: signalRx.trim()
    }
    rows.set(`${row.oltPort}:${row.onuId}`, row)
  }

  for (const line of raw.split(/\r?\n/)) {
    const command = line.match(/show\s+olt\s+rx-power\s+(\d+)(?:\s+(\d+))?/i)
    if (command?.[1]) {
      currentOltPort = normalizeDasanNumericId(command[1])
      currentOnuId = command[2] ? normalizeDasanNumericId(command[2]) : null
    }

    const match = line.match(/(\d+)\/(\d+)\s+(-?\d+(?:\.\d+)?\s*dBm)/)
    if (match?.[1] && match[2] && match[3]) {
      addRow(match[1], match[2], match[3])
      continue
    }
    if (!currentOltPort) continue

    if (currentOnuId) {
      const scopedSignal = line.match(/(-?\d+(?:\.\d+)?\s*dBm)/i)?.[1]
      if (scopedSignal) {
        addRow(currentOltPort, currentOnuId, scopedSignal)
        continue
      }
    }

    const tableMatch = line.match(/^\s*(\d+)\b.*?(-?\d+(?:\.\d+)?\s*dBm)/i)
    const onuId = tableMatch?.[1]
    const signalRx = tableMatch?.[2]
    if (!onuId || !signalRx) continue

    addRow(currentOltPort, onuId, signalRx)
  }

  return [...rows.values()]
}

export function parseDasanOnuIpHosts(raw: string): DasanOnuIpHostRow[] {
  const rows: DasanOnuIpHostRow[] = []
  let current: DasanOnuIpHostRow | null = null

  for (const line of raw.split(/\r?\n/)) {
    const header = line.match(/OLT\s*:\s*(\d+),\s*ONU\s*:\s*(\d+),\s*Host\s*:\s*([^\s(]+)/i)
    if (header) {
      if (current) rows.push(current)
      const [, oltPort, onuId, hostId] = header
      current = { oltPort: oltPort || '', onuId: onuId || '', hostId: hostId || '' }
      continue
    }

    if (!current) continue
    const field = line.match(/^\s*([^:]+?)\s*:\s*(.*)$/)
    if (!field) continue

    const [, rawKey, rawValue] = field
    const value = rawValue?.trim() || ''
    switch (rawKey?.trim().toLowerCase()) {
      case 'ip option':
        current.ipOption = value
        break
      case 'mac address':
        current.macAddress = value.toLowerCase()
        break
      case 'current ip':
        current.currentIp = value
        break
      case 'current mask':
        current.currentMask = value
        break
      case 'current gateway':
        current.currentGateway = value
        break
      case 'current primary dns':
        current.primaryDns = value
        break
      case 'current secondary dns':
        current.secondaryDns = value
        break
      case 'domain name':
        current.domainName = value
        break
      case 'host name':
        current.hostName = value
        break
    }
  }

  if (current) rows.push(current)

  return rows.filter(row => row.oltPort && row.onuId && row.hostId)
}

export interface NetflowRemoteInfo {
  address: string
  port: number
}

export interface ParsedNetflowPacket {
  exporterAddress: string
  exporterPort: number
  version: 5 | 9 | 10
  packetBytes: number
  recordCount: number
  exportedAt: string
  sequence: number
  sourceId: number
  interfaceFlows: NetflowInterfaceFlow[]
  flowRecords?: NetflowFlowRecord[]
  collectorHealth?: NetflowPacketHealth
  templates?: NetflowTemplateSnapshot[]
}

export interface NetflowInterfaceFlow {
  direction: 'input' | 'output'
  ifIndex: number
  bytes: number
  packets: number
  records: number
}

export interface NetflowAggregate {
  exporterAddress: string
  version: 5 | 9 | 10
  packetCount: number
  recordCount: number
  bytes: number
  firstExportedAt: string
  lastExportedAt: string
  lastSequence: number
  sourceIds: number[]
  interfaceFlows: NetflowInterfaceFlow[]
  collectorHealth: NetflowPacketHealth
  flowRecords: NetflowFlowRecord[]
  templates: NetflowTemplateSnapshot[]
}

export interface NetflowFlowRecord {
  exporterAddress: string
  exporterPort: number
  version: 5 | 9 | 10
  sourceId: number
  sequence: number
  exportedAt: string
  firstSeenAt: string | null
  lastSeenAt: string | null
  srcIp: string | null
  dstIp: string | null
  srcPort: number | null
  dstPort: number | null
  protocol: number | null
  tcpFlags: number | null
  tos: number | null
  bytes: number
  packets: number
  inputIfIndex: number | null
  outputIfIndex: number | null
  srcMac: string | null
  dstMac: string | null
  natSrcIp: string | null
  natDstIp: string | null
  natSrcPort: number | null
  natDstPort: number | null
}

export interface NetflowPacketHealth {
  templatesRefreshed: number
  dataRecords: number
  unknownTemplateRecords: number
  sequenceGaps: number
}

export interface NetflowTemplateSnapshot {
  exporterAddress: string
  version: 5 | 9 | 10
  sourceId: number
  templateId: number
  fields: NetflowTemplateField[]
  refreshedAt: string
}

export interface NetflowTemplateField {
  type: number
  length: number
  enterpriseId?: number
}

interface ParsedFlowsets {
  interfaceFlows: NetflowInterfaceFlow[]
  flowRecords: NetflowFlowRecord[]
  collectorHealth: NetflowPacketHealth
  templates: NetflowTemplateSnapshot[]
}

function exportedAtFromSeconds(seconds: number) {
  return new Date(seconds * 1000).toISOString()
}

function emptyHealth(): NetflowPacketHealth {
  return {
    templatesRefreshed: 0,
    dataRecords: 0,
    unknownTemplateRecords: 0,
    sequenceGaps: 0
  }
}

function mergeHealth(target: NetflowPacketHealth, source?: NetflowPacketHealth) {
  if (!source) return
  target.templatesRefreshed += source.templatesRefreshed
  target.dataRecords += source.dataRecords
  target.unknownTemplateRecords += source.unknownTemplateRecords
  target.sequenceGaps += source.sequenceGaps
}

function readVariableUIntBE(packet: Buffer, offset: number, length: number) {
  if (offset + length > packet.length || length <= 0) return 0
  let value = 0n
  for (let i = 0; i < length; i += 1) value = (value * 256n) + BigInt(packet[offset + i]!)
  return Number(value)
}

function readIpAddress(packet: Buffer, offset: number, length: number) {
  if (offset + length > packet.length) return null
  if (length === 4) return Array.from(packet.subarray(offset, offset + 4)).join('.')
  if (length === 16) {
    const parts: string[] = []
    for (let i = 0; i < 16; i += 2) parts.push(packet.readUInt16BE(offset + i).toString(16))
    return parts.join(':')
  }
  return null
}

function readMacAddress(packet: Buffer, offset: number, length: number) {
  if (length !== 6 || offset + length > packet.length) return null
  return Array.from(packet.subarray(offset, offset + length))
    .map(value => value.toString(16).padStart(2, '0'))
    .join(':')
}

function readEpochMilliseconds(packet: Buffer, offset: number, length: number) {
  if (offset + length > packet.length) return null
  const value = readVariableUIntBE(packet, offset, length)
  if (!Number.isFinite(value) || value <= 0) return null
  return new Date(value).toISOString()
}

function addInterfaceFlow(flows: NetflowInterfaceFlow[], direction: 'input' | 'output', ifIndex: number, bytes: number, packets: number) {
  if (!ifIndex) return
  const existing = flows.find(flow => flow.direction === direction && flow.ifIndex === ifIndex)
  if (existing) {
    existing.bytes += bytes
    existing.packets += packets
    existing.records += 1
    return
  }
  flows.push({ direction, ifIndex, bytes, packets, records: 1 })
}

function templateScope(remote: NetflowRemoteInfo, sourceId: number) {
  return `${remote.address}:${sourceId}`
}

function decodeFlowRecord(input: {
  packet: Buffer
  recordOffset: number
  fields: NetflowTemplateField[]
  remote: NetflowRemoteInfo
  version: 5 | 9 | 10
  sourceId: number
  sequence: number
  exportedAt: string
}) {
  let bytes = 0
  let packets = 0
  let inputIfIndex: number | null = null
  let outputIfIndex: number | null = null
  let srcIp: string | null = null
  let dstIp: string | null = null
  let srcPort: number | null = null
  let dstPort: number | null = null
  let protocol: number | null = null
  let tcpFlags: number | null = null
  let tos: number | null = null
  let srcMac: string | null = null
  let dstMac: string | null = null
  let natSrcIp: string | null = null
  let natDstIp: string | null = null
  let natSrcPort: number | null = null
  let natDstPort: number | null = null
  let firstSeenAt: string | null = null
  let lastSeenAt: string | null = null
  let fieldOffset = input.recordOffset

  for (const field of input.fields) {
    const value = readVariableUIntBE(input.packet, fieldOffset, field.length)
    if (field.type === 1) bytes = value
    if (field.type === 2) packets = value
    if (field.type === 4) protocol = value
    if (field.type === 5) tos = value
    if (field.type === 6) tcpFlags = value
    if (field.type === 7) srcPort = value
    if (field.type === 8 || field.type === 27) srcIp = readIpAddress(input.packet, fieldOffset, field.length)
    if (field.type === 10) inputIfIndex = value
    if (field.type === 11) dstPort = value
    if (field.type === 12 || field.type === 28) dstIp = readIpAddress(input.packet, fieldOffset, field.length)
    if (field.type === 14) outputIfIndex = value
    if (field.type === 56) srcMac = readMacAddress(input.packet, fieldOffset, field.length)
    if (field.type === 57 || field.type === 80 || field.type === 81) dstMac = readMacAddress(input.packet, fieldOffset, field.length)
    if (field.type === 152) firstSeenAt = readEpochMilliseconds(input.packet, fieldOffset, field.length)
    if (field.type === 153) lastSeenAt = readEpochMilliseconds(input.packet, fieldOffset, field.length)
    if (field.type === 225) natSrcIp = readIpAddress(input.packet, fieldOffset, field.length)
    if (field.type === 226) natDstIp = readIpAddress(input.packet, fieldOffset, field.length)
    if (field.type === 227) natSrcPort = value
    if (field.type === 228) natDstPort = value
    fieldOffset += field.length
  }

  return {
    exporterAddress: input.remote.address,
    exporterPort: input.remote.port,
    version: input.version,
    sourceId: input.sourceId,
    sequence: input.sequence,
    exportedAt: input.exportedAt,
    firstSeenAt,
    lastSeenAt,
    srcIp,
    dstIp,
    srcPort,
    dstPort,
    protocol,
    tcpFlags,
    tos,
    bytes,
    packets,
    inputIfIndex,
    outputIfIndex,
    srcMac,
    dstMac,
    natSrcIp,
    natDstIp,
    natSrcPort,
    natDstPort
  } satisfies NetflowFlowRecord
}

function parseNetflowV9Flowsets(packet: Buffer, remote: NetflowRemoteInfo, sourceId: number, sequence: number, exportedAt: string, templates: Map<string, NetflowTemplateField[]>): ParsedFlowsets {
  const flows: NetflowInterfaceFlow[] = []
  const flowRecords: NetflowFlowRecord[] = []
  const collectorHealth = emptyHealth()
  const templateSnapshots: NetflowTemplateSnapshot[] = []
  const scope = templateScope(remote, sourceId)
  let offset = 20

  while (offset + 4 <= packet.length) {
    const flowSetId = packet.readUInt16BE(offset)
    const length = packet.readUInt16BE(offset + 2)
    if (length < 4 || offset + length > packet.length) break

    if (flowSetId === 0) {
      let templateOffset = offset + 4
      const end = offset + length
      while (templateOffset + 4 <= end) {
        const templateId = packet.readUInt16BE(templateOffset)
        const fieldCount = packet.readUInt16BE(templateOffset + 2)
        templateOffset += 4
        const fields: NetflowTemplateField[] = []
        for (let i = 0; i < fieldCount && templateOffset + 4 <= end; i += 1) {
          fields.push({
            type: packet.readUInt16BE(templateOffset),
            length: packet.readUInt16BE(templateOffset + 2)
          })
          templateOffset += 4
        }
        templates.set(`${scope}:${templateId}`, fields)
        collectorHealth.templatesRefreshed += 1
        templateSnapshots.push({
          exporterAddress: remote.address,
          version: 9,
          sourceId,
          templateId,
          fields,
          refreshedAt: exportedAt
        })
      }
    } else if (flowSetId >= 256) {
      const fields = templates.get(`${scope}:${flowSetId}`)
      const recordLength = fields?.reduce((sum, field) => sum + field.length, 0) || 0
      if (fields && recordLength > 0) {
        let recordOffset = offset + 4
        const end = offset + length
        while (recordOffset + recordLength <= end) {
          const record = decodeFlowRecord({ packet, recordOffset, fields, remote, version: 9, sourceId, sequence, exportedAt })
          flowRecords.push(record)
          collectorHealth.dataRecords += 1
          addInterfaceFlow(flows, 'input', record.inputIfIndex || 0, record.bytes, record.packets)
          addInterfaceFlow(flows, 'output', record.outputIfIndex || 0, record.bytes, record.packets)
          recordOffset += recordLength
        }
      } else {
        collectorHealth.unknownTemplateRecords += 1
      }
    }

    offset += length
  }

  return { interfaceFlows: flows, flowRecords, collectorHealth, templates: templateSnapshots }
}

function parseIpfixFlowsets(packet: Buffer, remote: NetflowRemoteInfo, sourceId: number, sequence: number, exportedAt: string, templates: Map<string, NetflowTemplateField[]>): ParsedFlowsets {
  const flows: NetflowInterfaceFlow[] = []
  const flowRecords: NetflowFlowRecord[] = []
  const collectorHealth = emptyHealth()
  const templateSnapshots: NetflowTemplateSnapshot[] = []
  const scope = templateScope(remote, sourceId)
  let offset = 16

  while (offset + 4 <= packet.length) {
    const setId = packet.readUInt16BE(offset)
    const length = packet.readUInt16BE(offset + 2)
    if (length < 4 || offset + length > packet.length) break

    if (setId === 2) {
      let templateOffset = offset + 4
      const end = offset + length
      while (templateOffset + 4 <= end) {
        const templateId = packet.readUInt16BE(templateOffset)
        const fieldCount = packet.readUInt16BE(templateOffset + 2)
        templateOffset += 4
        const fields: NetflowTemplateField[] = []
        for (let i = 0; i < fieldCount && templateOffset + 4 <= end; i += 1) {
          const rawType = packet.readUInt16BE(templateOffset)
          const enterprise = (rawType & 0x8000) !== 0
          const type = rawType & 0x7fff
          const fieldLength = packet.readUInt16BE(templateOffset + 2)
          templateOffset += 4
          let enterpriseId: number | undefined
          if (enterprise && templateOffset + 4 <= end) {
            enterpriseId = packet.readUInt32BE(templateOffset)
            templateOffset += 4
          }
          fields.push({ type, length: fieldLength, enterpriseId })
        }
        templates.set(`${scope}:${templateId}`, fields)
        collectorHealth.templatesRefreshed += 1
        templateSnapshots.push({
          exporterAddress: remote.address,
          version: 10,
          sourceId,
          templateId,
          fields,
          refreshedAt: exportedAt
        })
      }
    } else if (setId >= 256) {
      const fields = templates.get(`${scope}:${setId}`)
      const recordLength = fields?.reduce((sum, field) => sum + field.length, 0) || 0
      if (fields && recordLength > 0) {
        let recordOffset = offset + 4
        const end = offset + length
        while (recordOffset + recordLength <= end) {
          const record = decodeFlowRecord({ packet, recordOffset, fields, remote, version: 10, sourceId, sequence, exportedAt })
          flowRecords.push(record)
          collectorHealth.dataRecords += 1
          addInterfaceFlow(flows, 'input', record.inputIfIndex || 0, record.bytes, record.packets)
          addInterfaceFlow(flows, 'output', record.outputIfIndex || 0, record.bytes, record.packets)
          recordOffset += recordLength
        }
      } else {
        collectorHealth.unknownTemplateRecords += 1
      }
    }

    offset += length
  }

  return { interfaceFlows: flows, flowRecords, collectorHealth, templates: templateSnapshots }
}

export function parseNetflowPacket(packet: Buffer, remote: NetflowRemoteInfo, templates = new Map<string, NetflowTemplateField[]>()): ParsedNetflowPacket | null {
  if (packet.length < 4) return null

  const version = packet.readUInt16BE(0)
  if (version === 5) {
    if (packet.length < 24) return null

    return {
      exporterAddress: remote.address,
      exporterPort: remote.port,
      version,
      packetBytes: packet.length,
      recordCount: packet.readUInt16BE(2),
      exportedAt: exportedAtFromSeconds(packet.readUInt32BE(8)),
      sequence: packet.readUInt32BE(16),
      sourceId: packet.readUInt8(23),
      interfaceFlows: [],
      flowRecords: [],
      collectorHealth: emptyHealth(),
      templates: []
    }
  }

  if (version === 9) {
    if (packet.length < 20) return null

    const sourceId = packet.readUInt32BE(16)
    const sequence = packet.readUInt32BE(12)
    const exportedAt = exportedAtFromSeconds(packet.readUInt32BE(8))
    const parsed = parseNetflowV9Flowsets(packet, remote, sourceId, sequence, exportedAt, templates)
    return {
      exporterAddress: remote.address,
      exporterPort: remote.port,
      version,
      packetBytes: packet.length,
      recordCount: packet.readUInt16BE(2),
      exportedAt,
      sequence,
      sourceId,
      interfaceFlows: parsed.interfaceFlows,
      flowRecords: parsed.flowRecords,
      collectorHealth: parsed.collectorHealth,
      templates: parsed.templates
    }
  }

  if (version === 10) {
    if (packet.length < 16) return null

    const sequence = packet.readUInt32BE(8)
    const sourceId = packet.readUInt32BE(12)
    const exportedAt = exportedAtFromSeconds(packet.readUInt32BE(4))
    const parsed = parseIpfixFlowsets(packet, remote, sourceId, sequence, exportedAt, templates)
    return {
      exporterAddress: remote.address,
      exporterPort: remote.port,
      version,
      packetBytes: packet.length,
      recordCount: parsed.collectorHealth.dataRecords,
      exportedAt,
      sequence,
      sourceId,
      interfaceFlows: parsed.interfaceFlows,
      flowRecords: parsed.flowRecords,
      collectorHealth: parsed.collectorHealth,
      templates: parsed.templates
    }
  }

  return null
}

export function createNetflowParser() {
  const templates = new Map<string, NetflowTemplateField[]>()
  const lastSequenceByScope = new Map<string, number>()
  return {
    parse(packet: Buffer, remote: NetflowRemoteInfo) {
      const parsed = parseNetflowPacket(packet, remote, templates)
      if (!parsed) return null

      const key = `${remote.address}:${parsed.version}:${parsed.sourceId}`
      const lastSequence = lastSequenceByScope.get(key)
      if (typeof lastSequence === 'number' && parsed.sequence > lastSequence + 1) {
        parsed.collectorHealth = parsed.collectorHealth || emptyHealth()
        parsed.collectorHealth.sequenceGaps += 1
      }
      lastSequenceByScope.set(key, parsed.sequence)
      return parsed
    }
  }
}

function aggregateKey(packet: ParsedNetflowPacket) {
  return `${packet.exporterAddress}:${packet.version}`
}

export function createNetflowAccumulator() {
  const aggregates = new Map<string, NetflowAggregate>()

  return {
    add(packet: ParsedNetflowPacket) {
      const key = aggregateKey(packet)
      const existing = aggregates.get(key)
      if (!existing) {
        aggregates.set(key, {
          exporterAddress: packet.exporterAddress,
          version: packet.version,
          packetCount: 1,
          recordCount: packet.recordCount,
          bytes: packet.packetBytes,
          firstExportedAt: packet.exportedAt,
          lastExportedAt: packet.exportedAt,
          lastSequence: packet.sequence,
          sourceIds: [packet.sourceId],
          interfaceFlows: packet.interfaceFlows,
          collectorHealth: { ...emptyHealth(), ...(packet.collectorHealth || {}) },
          flowRecords: [...(packet.flowRecords || [])],
          templates: [...(packet.templates || [])]
        })
        return
      }

      existing.packetCount += 1
      existing.recordCount += packet.recordCount
      existing.bytes += packet.packetBytes
      existing.lastExportedAt = packet.exportedAt
      existing.lastSequence = packet.sequence
      existing.sourceIds = [...new Set([...existing.sourceIds, packet.sourceId])].sort((a, b) => a - b)
      mergeHealth(existing.collectorHealth, packet.collectorHealth)
      existing.flowRecords.push(...(packet.flowRecords || []))
      existing.templates.push(...(packet.templates || []))
      for (const flow of packet.interfaceFlows) {
        addInterfaceFlow(existing.interfaceFlows, flow.direction, flow.ifIndex, flow.bytes, flow.packets)
      }
    },
    flush() {
      const values = [...aggregates.values()]
      aggregates.clear()
      return values
    }
  }
}

import { describe, expect, it } from 'vitest'
import { createNetflowAccumulator, createNetflowParser, parseNetflowPacket } from './collector'

describe('NetFlow collector', () => {
  it('parses NetFlow v9 packet headers', () => {
    const packet = Buffer.alloc(20)
    packet.writeUInt16BE(9, 0)
    packet.writeUInt16BE(3, 2)
    packet.writeUInt32BE(123456, 4)
    packet.writeUInt32BE(1770000000, 8)
    packet.writeUInt32BE(42, 12)
    packet.writeUInt32BE(7, 16)

    expect(parseNetflowPacket(packet, { address: '10.0.222.86', port: 12345 })).toMatchObject({
      exporterAddress: '10.0.222.86',
      exporterPort: 12345,
      version: 9,
      packetBytes: 20,
      recordCount: 3,
      exportedAt: '2026-02-02T02:40:00.000Z',
      sequence: 42,
      sourceId: 7,
      interfaceFlows: [],
      flowRecords: [],
      collectorHealth: {
        templatesRefreshed: 0,
        dataRecords: 0,
        unknownTemplateRecords: 0,
        sequenceGaps: 0
      }
    })
  })

  it('parses IPFIX v10 packet headers', () => {
    const packet = Buffer.alloc(16)
    packet.writeUInt16BE(10, 0)
    packet.writeUInt16BE(16, 2)
    packet.writeUInt32BE(1770000001, 4)
    packet.writeUInt32BE(77, 8)
    packet.writeUInt32BE(12, 12)

    expect(parseNetflowPacket(packet, { address: '10.0.222.4', port: 33333 })).toMatchObject({
      exporterAddress: '10.0.222.4',
      version: 10,
      packetBytes: 16,
      recordCount: 0,
      exportedAt: '2026-02-02T02:40:01.000Z',
      sequence: 77,
      sourceId: 12,
      interfaceFlows: []
    })
  })

  it('aggregates packets by exporter and version', () => {
    const accumulator = createNetflowAccumulator()
    accumulator.add({
      exporterAddress: '10.0.222.86',
      exporterPort: 20000,
      version: 9,
      packetBytes: 120,
      recordCount: 4,
      exportedAt: '2026-02-03T02:40:00.000Z',
      sequence: 1,
      sourceId: 7,
      interfaceFlows: [{ direction: 'input', ifIndex: 12, bytes: 100, packets: 3, records: 1 }]
    })
    accumulator.add({
      exporterAddress: '10.0.222.86',
      exporterPort: 20001,
      version: 9,
      packetBytes: 130,
      recordCount: 5,
      exportedAt: '2026-02-03T02:40:01.000Z',
      sequence: 2,
      sourceId: 7,
      interfaceFlows: [{ direction: 'input', ifIndex: 12, bytes: 140, packets: 4, records: 1 }]
    })

    expect(accumulator.flush()).toEqual([{
      exporterAddress: '10.0.222.86',
      version: 9,
      packetCount: 2,
      recordCount: 9,
      bytes: 250,
      firstExportedAt: '2026-02-03T02:40:00.000Z',
      lastExportedAt: '2026-02-03T02:40:01.000Z',
      lastSequence: 2,
      sourceIds: [7],
      interfaceFlows: [{ direction: 'input', ifIndex: 12, bytes: 240, packets: 7, records: 2 }],
      collectorHealth: {
        templatesRefreshed: 0,
        dataRecords: 0,
        unknownTemplateRecords: 0,
        sequenceGaps: 0
      },
      flowRecords: [],
      templates: []
    }])
    expect(accumulator.flush()).toEqual([])
  })

  it('parses NetFlow v9 input and output interface counters from templates', () => {
    const parser = createNetflowParser()
    const remote = { address: '10.0.222.86', port: 2055 }
    const template = Buffer.alloc(44)
    template.writeUInt16BE(9, 0)
    template.writeUInt16BE(1, 2)
    template.writeUInt32BE(1, 4)
    template.writeUInt32BE(1770000000, 8)
    template.writeUInt32BE(1, 12)
    template.writeUInt32BE(0, 16)
    template.writeUInt16BE(0, 20)
    template.writeUInt16BE(24, 22)
    template.writeUInt16BE(256, 24)
    template.writeUInt16BE(4, 26)
    template.writeUInt16BE(1, 28)
    template.writeUInt16BE(4, 30)
    template.writeUInt16BE(2, 32)
    template.writeUInt16BE(4, 34)
    template.writeUInt16BE(10, 36)
    template.writeUInt16BE(2, 38)
    template.writeUInt16BE(14, 40)
    template.writeUInt16BE(2, 42)

    expect(parser.parse(template, remote)?.interfaceFlows).toEqual([])

    const data = Buffer.alloc(36)
    data.writeUInt16BE(9, 0)
    data.writeUInt16BE(1, 2)
    data.writeUInt32BE(2, 4)
    data.writeUInt32BE(1770000001, 8)
    data.writeUInt32BE(2, 12)
    data.writeUInt32BE(0, 16)
    data.writeUInt16BE(256, 20)
    data.writeUInt16BE(16, 22)
    data.writeUInt32BE(1500, 24)
    data.writeUInt32BE(10, 28)
    data.writeUInt16BE(17, 32)
    data.writeUInt16BE(18, 34)

    expect(parser.parse(data, remote)?.interfaceFlows).toEqual([
      { direction: 'input', ifIndex: 17, bytes: 1500, packets: 10, records: 1 },
      { direction: 'output', ifIndex: 18, bytes: 1500, packets: 10, records: 1 }
    ])
  })

  it('parses IPFIX templates and full flow records including MAC and NAT fields', () => {
    const parser = createNetflowParser()
    const remote = { address: '10.0.222.86', port: 2055 }
    const fields = [
      [8, 4],
      [12, 4],
      [7, 2],
      [11, 2],
      [4, 1],
      [6, 1],
      [1, 8],
      [2, 8],
      [10, 4],
      [14, 4],
      [56, 6],
      [80, 6],
      [225, 4],
      [226, 4],
      [227, 2],
      [228, 2],
      [152, 8],
      [153, 8]
    ] as const
    const template = Buffer.alloc(16 + 4 + 4 + (fields.length * 4))
    template.writeUInt16BE(10, 0)
    template.writeUInt16BE(template.length, 2)
    template.writeUInt32BE(1770000000, 4)
    template.writeUInt32BE(1, 8)
    template.writeUInt32BE(123, 12)
    template.writeUInt16BE(2, 16)
    template.writeUInt16BE(template.length - 16, 18)
    template.writeUInt16BE(256, 20)
    template.writeUInt16BE(fields.length, 22)
    fields.forEach(([type, length], index) => {
      template.writeUInt16BE(type, 24 + (index * 4))
      template.writeUInt16BE(length, 26 + (index * 4))
    })

    expect(parser.parse(template, remote)?.flowRecords).toEqual([])

    const data = Buffer.alloc(16 + 4 + 78)
    data.writeUInt16BE(10, 0)
    data.writeUInt16BE(data.length, 2)
    data.writeUInt32BE(1770000001, 4)
    data.writeUInt32BE(2, 8)
    data.writeUInt32BE(123, 12)
    data.writeUInt16BE(256, 16)
    data.writeUInt16BE(data.length - 16, 18)
    let offset = 20
    Buffer.from([10, 40, 0, 10]).copy(data, offset)
    offset += 4
    Buffer.from([1, 1, 1, 1]).copy(data, offset)
    offset += 4
    data.writeUInt16BE(54321, offset)
    offset += 2
    data.writeUInt16BE(443, offset)
    offset += 2
    data.writeUInt8(6, offset)
    offset += 1
    data.writeUInt8(24, offset)
    offset += 1
    data.writeBigUInt64BE(1500n, offset)
    offset += 8
    data.writeBigUInt64BE(10n, offset)
    offset += 8
    data.writeUInt32BE(17, offset)
    offset += 4
    data.writeUInt32BE(18, offset)
    offset += 4
    Buffer.from([0, 17, 34, 51, 68, 85]).copy(data, offset)
    offset += 6
    Buffer.from([170, 187, 204, 221, 238, 255]).copy(data, offset)
    offset += 6
    Buffer.from([100, 64, 1, 2]).copy(data, offset)
    offset += 4
    Buffer.from([1, 1, 1, 1]).copy(data, offset)
    offset += 4
    data.writeUInt16BE(62000, offset)
    offset += 2
    data.writeUInt16BE(443, offset)
    offset += 2
    data.writeBigUInt64BE(1770000000000n, offset)
    offset += 8
    data.writeBigUInt64BE(1770000001000n, offset)

    expect(parser.parse(data, remote)?.flowRecords).toEqual([{
      exporterAddress: '10.0.222.86',
      exporterPort: 2055,
      version: 10,
      sourceId: 123,
      sequence: 2,
      exportedAt: '2026-02-02T02:40:01.000Z',
      firstSeenAt: '2026-02-02T02:40:00.000Z',
      lastSeenAt: '2026-02-02T02:40:01.000Z',
      srcIp: '10.40.0.10',
      dstIp: '1.1.1.1',
      srcPort: 54321,
      dstPort: 443,
      protocol: 6,
      tcpFlags: 24,
      tos: null,
      bytes: 1500,
      packets: 10,
      inputIfIndex: 17,
      outputIfIndex: 18,
      srcMac: '00:11:22:33:44:55',
      dstMac: 'aa:bb:cc:dd:ee:ff',
      natSrcIp: '100.64.1.2',
      natDstIp: '1.1.1.1',
      natSrcPort: 62000,
      natDstPort: 443
    }])
  })

  it('reports unknown template data sets without crashing', () => {
    const parser = createNetflowParser()
    const packet = Buffer.alloc(24)
    packet.writeUInt16BE(10, 0)
    packet.writeUInt16BE(packet.length, 2)
    packet.writeUInt32BE(1770000001, 4)
    packet.writeUInt32BE(2, 8)
    packet.writeUInt32BE(123, 12)
    packet.writeUInt16BE(300, 16)
    packet.writeUInt16BE(8, 18)

    const parsed = parser.parse(packet, { address: '10.0.222.86', port: 2055 })

    expect(parsed?.flowRecords).toEqual([])
    expect(parsed?.collectorHealth?.unknownTemplateRecords).toBe(1)
  })

  it('reports exporter sequence gaps in parser health', () => {
    const parser = createNetflowParser()
    const remote = { address: '10.0.222.86', port: 2055 }
    const first = Buffer.alloc(20)
    first.writeUInt16BE(9, 0)
    first.writeUInt32BE(1770000001, 8)
    first.writeUInt32BE(10, 12)
    first.writeUInt32BE(123, 16)
    const second = Buffer.alloc(20)
    second.writeUInt16BE(9, 0)
    second.writeUInt32BE(1770000002, 8)
    second.writeUInt32BE(12, 12)
    second.writeUInt32BE(123, 16)

    expect(parser.parse(first, remote)?.collectorHealth?.sequenceGaps).toBe(0)
    expect(parser.parse(second, remote)?.collectorHealth?.sequenceGaps).toBe(1)
  })
})

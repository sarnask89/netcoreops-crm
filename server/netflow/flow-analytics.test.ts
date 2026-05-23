import { describe, expect, it } from 'vitest'
import { aggregateFlowRecords, enrichFlowRecord } from './flow-analytics'
import type { NetflowFlowRecord } from './collector'

const baseFlow: NetflowFlowRecord = {
  exporterAddress: '10.0.222.86',
  exporterPort: 2055,
  version: 10,
  sourceId: 1,
  sequence: 1,
  exportedAt: '2026-02-02T02:40:30.000Z',
  firstSeenAt: '2026-02-02T02:40:00.000Z',
  lastSeenAt: '2026-02-02T02:40:30.000Z',
  srcIp: '10.40.0.10',
  dstIp: '1.1.1.1',
  srcPort: 54321,
  dstPort: 443,
  protocol: 6,
  tcpFlags: 24,
  tos: null,
  bytes: 9000,
  packets: 30,
  inputIfIndex: 17,
  outputIfIndex: 18,
  srcMac: '00:11:22:33:44:55',
  dstMac: null,
  natSrcIp: '100.64.1.2',
  natDstIp: null,
  natSrcPort: 62000,
  natDstPort: null
}

describe('NetFlow flow analytics', () => {
  it('enriches local user by MAC before IP and classifies upload', () => {
    expect(enrichFlowRecord(baseFlow, {
      localNetworks: ['10.40.0.0/16'],
      devices: [{
        id: 'device-1',
        customerId: 'customer-1',
        hostname: 'router-cpe',
        ipAddress: '10.40.0.99',
        macAddress: '00:11:22:33:44:55'
      }]
    })).toMatchObject({
      direction: 'upload',
      localIp: '10.40.0.10',
      remoteIp: '1.1.1.1',
      customerDeviceId: 'device-1',
      customerId: 'customer-1',
      confidence: 'mac'
    })
  })

  it('falls back to lease IP and rejects flows outside selected local networks', () => {
    expect(enrichFlowRecord({ ...baseFlow, srcMac: null }, {
      localNetworks: ['10.40.0.0/16'],
      devices: [{
        id: 'device-2',
        customerId: 'customer-2',
        hostname: 'lease-only',
        ipAddress: '10.40.0.10',
        macAddress: null
      }]
    })).toMatchObject({
      customerDeviceId: 'device-2',
      confidence: 'lease-ip'
    })

    expect(enrichFlowRecord({ ...baseFlow, srcIp: '192.0.2.10' }, {
      localNetworks: ['10.40.0.0/16'],
      devices: []
    })).toMatchObject({
      direction: 'unknown',
      confidence: 'unknown',
      userKey: 'unknown'
    })
  })

  it('aggregates bytes to bps for interface and user buckets', () => {
    const enriched = enrichFlowRecord(baseFlow, {
      localNetworks: ['10.40.0.0/16'],
      devices: [{
        id: 'device-1',
        customerId: 'customer-1',
        hostname: 'router-cpe',
        ipAddress: '10.40.0.10',
        macAddress: '00:11:22:33:44:55'
      }]
    })

    expect(aggregateFlowRecords([enriched], 60)).toEqual({
      interfaceRollups: [
        {
          bucket: '2026-02-02T02:40:00.000Z',
          exporterAddress: '10.0.222.86',
          ifIndex: 17,
          direction: 'input',
          bytes: 9000,
          packets: 30,
          flows: 1,
          bps: 1200
        },
        {
          bucket: '2026-02-02T02:40:00.000Z',
          exporterAddress: '10.0.222.86',
          ifIndex: 18,
          direction: 'output',
          bytes: 9000,
          packets: 30,
          flows: 1,
          bps: 1200
        }
      ],
      userRollups: [{
        bucket: '2026-02-02T02:40:00.000Z',
        exporterAddress: '10.0.222.86',
        userKey: 'device:device-1',
        customerDeviceId: 'device-1',
        customerId: 'customer-1',
        localIp: '10.40.0.10',
        direction: 'upload',
        bytes: 9000,
        packets: 30,
        flows: 1,
        bps: 1200
      }]
    })
  })
})

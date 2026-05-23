import { describe, expect, it } from 'vitest'
import { parseDasanMacTable, parseDasanOnuActive, parseDasanOnuIpHosts, parseDasanRxPower } from './parsers/dasan-parser'
import { parseMikrotikComment } from './parsers/mikrotik-comment-parser'
import { parseRateLimit } from './parsers/rate-limit-parser'
import { analyzeTransparentOnu } from '../ftth/transparent-onu-detector'

describe('network driver parsers', () => {
  it('parses MikroTik comments with street shortcuts and apartment numbers', () => {
    expect(parseMikrotikComment('1825 Krupka M/33 Mic25')).toEqual({
      externalId: '1825',
      lastName: 'Krupka',
      apartmentNumber: '33',
      streetName: 'Adama Mickiewicza',
      streetNumber: '25'
    })
  })

  it('parses MikroTik comments with hyphenated names and no apartment number', () => {
    expect(parseMikrotikComment('4444 Nowak-Kowalski ak10')).toEqual({
      externalId: '4444',
      lastName: 'Nowak-Kowalski',
      apartmentNumber: '',
      streetName: 'Armii Krajowej',
      streetNumber: '10'
    })
  })

  it('returns null for unsupported MikroTik comment formats', () => {
    expect(parseMikrotikComment('')).toBeNull()
    expect(parseMikrotikComment('Invalid format')).toBeNull()
    expect(parseMikrotikComment('1234 OnlyName')).toBeNull()
  })

  it('parses RouterOS rate-limit as upload/download Mbps', () => {
    expect(parseRateLimit('300M/1000M')).toEqual({ uploadMbps: 300, downloadMbps: 1000 })
    expect(parseRateLimit('512k/2M')).toEqual({ uploadMbps: 1, downloadMbps: 2 })
    expect(parseRateLimit('')).toEqual({ uploadMbps: null, downloadMbps: null })
  })

  it('parses Dasan ONU active output', () => {
    const raw = '    1 |   5 |   Active | manual | HALN08196530 | 3030... | 16:05:55:37'

    expect(parseDasanOnuActive(raw)).toEqual([{
      oltPort: '1',
      onuId: '5',
      status: 'Active',
      serialNumber: 'HALN08196530',
      uptime: '16:05:55:37'
    }])
  })

  it('normalizes Dasan ONU active numeric identifiers', () => {
    const raw = '    01 |   005 |   Active | manual | HALN08196530 | 3030... | 16:05:55:37'

    expect(parseDasanOnuActive(raw)).toEqual([{
      oltPort: '1',
      onuId: '5',
      status: 'Active',
      serialNumber: 'HALN08196530',
      uptime: '16:05:55:37'
    }])
  })

  it('parses Dasan MAC tables from OLT and bridge output', () => {
    const oltRaw = '   1 |    1 |   5 | 54:db:a2:11:e7:31 |   208  |  100 | dynamic'
    const bridgeRaw = '100 eth04 9c:65:ee:92:ef:a1 OK dynamic 6.89'

    expect(parseDasanMacTable(oltRaw)).toEqual([{
      oltPort: '1',
      onuId: '5',
      macAddress: '54:db:a2:11:e7:31',
      gemId: '208',
      vlanId: '100',
      status: 'dynamic'
    }])
    expect(parseDasanMacTable(bridgeRaw)).toEqual([{
      port: 'eth04',
      macAddress: '9c:65:ee:92:ef:a1',
      vlanId: '100',
      status: 'dynamic'
    }])
  })

  it('skips placeholder zero MACs from Dasan tables', () => {
    expect(parseDasanMacTable('   1 |    1 |   8 | 00:00:00:00:00:00 |   208  |  100 | dynamic')).toEqual([])
    expect(parseDasanMacTable('100 eth04 00:00:00:00:00:00 OK dynamic 6.89')).toEqual([])
  })

  it('parses Dasan RX power per ONU', () => {
    expect(parseDasanRxPower('1/1   -20.10 dBm\n1/2   -28.44 dBm')).toEqual([
      { oltPort: '1', onuId: '1', signalRx: '-20.10 dBm' },
      { oltPort: '1', onuId: '2', signalRx: '-28.44 dBm' }
    ])
  })

  it('parses Dasan RX power tables scoped by command echo', () => {
    expect(parseDasanRxPower('show olt rx-power 1\n 1 | -20.10 dBm\n 2 | -28.44 dBm')).toEqual([
      { oltPort: '1', onuId: '1', signalRx: '-20.10 dBm' },
      { oltPort: '1', onuId: '2', signalRx: '-28.44 dBm' }
    ])
  })

  it('parses mixed Dasan RX power formats from multiple command outputs', () => {
    const raw = `
show olt rx-power 1
1/1   -20.10 dBm
 02 | -28.44 dBm
show olt rx-power 2
 1 | -19.70 dBm
 2/03   -23.01 dBm
`

    expect(parseDasanRxPower(raw)).toEqual([
      { oltPort: '1', onuId: '1', signalRx: '-20.10 dBm' },
      { oltPort: '1', onuId: '2', signalRx: '-28.44 dBm' },
      { oltPort: '2', onuId: '1', signalRx: '-19.70 dBm' },
      { oltPort: '2', onuId: '3', signalRx: '-23.01 dBm' }
    ])
  })

  it('parses Dasan RX power output scoped to a single ONU command', () => {
    const raw = `
show olt rx-power 15 43
Rx Power : -23.1200 dBm
show olt rx-power 15 44
Rx Power : -40.0000 dBm
`

    expect(parseDasanRxPower(raw)).toEqual([
      { oltPort: '15', onuId: '43', signalRx: '-23.1200 dBm' },
      { oltPort: '15', onuId: '44', signalRx: '-40.0000 dBm' }
    ])
  })

  it('parses Dasan ONU IP hosts with separate management MAC and IP', () => {
    const raw = `
---------------------------------------------------------------
 OLT : 1, ONU : 8, Host : 1(0x0000)
---------------------------------------------------------------
 IP Option             : DHCP
 MAC Address           : 54:db:a2:18:ce:98
 Current IP            : 10.40.0.242
 Current Mask          : 255.255.0.0
 Current Gateway       : 10.40.0.1
 Current Primary DNS   : 194.204.159.1
 Current Secondary DNS : 0.0.0.0
 Domain name           :
 Host name             : IPHOST: WWW/XML/TR069
---------------------------------------------------------------
 OLT : 1, ONU : 8, Host : 2(0x0001)
---------------------------------------------------------------
 IP Option             : DHCP
 MAC Address           : 54:db:a2:18:ce:99
 Current IP            : 192.168.3.247
 Host name             : VEIP(WAN1): DHCP(100)
`

    expect(parseDasanOnuIpHosts(raw)).toEqual([
      {
        oltPort: '1',
        onuId: '8',
        hostId: '1',
        ipOption: 'DHCP',
        macAddress: '54:db:a2:18:ce:98',
        currentIp: '10.40.0.242',
        currentMask: '255.255.0.0',
        currentGateway: '10.40.0.1',
        primaryDns: '194.204.159.1',
        secondaryDns: '0.0.0.0',
        domainName: '',
        hostName: 'IPHOST: WWW/XML/TR069'
      },
      {
        oltPort: '1',
        onuId: '8',
        hostId: '2',
        ipOption: 'DHCP',
        macAddress: '54:db:a2:18:ce:99',
        currentIp: '192.168.3.247',
        hostName: 'VEIP(WAN1): DHCP(100)'
      }
    ])
  })

  it('detects transparent ONU candidates from multiple downstream MACs without VLAN 400 management MAC', () => {
    const analysis = analyzeTransparentOnu([
      { macAddress: '54:db:a2:18:ce:98', vlanId: '400' },
      { macAddress: 'AA:BB:CC:00:00:01', vlanId: '100' },
      { macAddress: 'AA:BB:CC:00:00:02', vlanId: '100' }
    ], [{
      macAddress: 'aa:bb:cc:00:00:01',
      type: 'CUSTOMER_DEVICE_BEHIND_ONU',
      targetId: 'customer-device-1'
    }, {
      macAddress: 'aa:bb:cc:00:00:02',
      type: 'BACKBONE_BEHIND_ONU',
      targetId: 'backbone-1'
    }], ['54:db:a2:18:ce:98'])

    expect(analysis).toEqual({
      transparentCandidate: true,
      downstreamMacs: ['aa:bb:cc:00:00:01', 'aa:bb:cc:00:00:02'],
      links: [{
        macAddress: 'aa:bb:cc:00:00:01',
        linkType: 'CUSTOMER_DEVICE_BEHIND_ONU',
        targetId: 'customer-device-1'
      }, {
        macAddress: 'aa:bb:cc:00:00:02',
        linkType: 'BACKBONE_BEHIND_ONU',
        targetId: 'backbone-1'
      }]
    })
  })
})

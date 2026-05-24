import { describe, expect, it } from 'vitest'
import {
  buildNetflowInterfacePlan,
  extractBridgePortInterfaces,
  extractDefaultGatewayInterfaces,
  extractVlanParentInterfaces,
  parseInterfaceSpeedBps,
  parseNetflowCollector,
  resolveInterfaceSpeedBps
} from './netflow'

describe('RouterOS NetFlow planning', () => {
  it('parses collector address and port', () => {
    expect(parseNetflowCollector('10.0.222.226:2055')).toEqual({
      address: '10.0.222.226',
      port: 2055,
      version: 'ipfix'
    })
  })

  it('selects DHCP bridge ports and active default gateway uplinks', () => {
    const plan = buildNetflowInterfacePlan({
      dhcpServers: [
        { name: 'dhcp-lan', interface: 'bridge-lan', disabled: 'false' },
        { name: 'dhcp-guest', interface: 'vlan100', disabled: 'false' },
        { name: 'dhcp-old', interface: 'bridge-old', disabled: 'true' }
      ],
      routes: [
        { 'dst-address': '0.0.0.0/0', 'active': 'true', 'immediate-gw': '10.0.87.1%ether1' },
        { 'dst-address': '0.0.0.0/0', 'active': 'yes', 'gateway': 'pppoe-out1' },
        { 'dst-address': '10.10.0.0/16', 'active': 'true', 'gateway': 'bridge-lan' }
      ],
      bridgePorts: [
        { bridge: 'bridge-lan', interface: 'ether2', disabled: 'false' },
        { bridge: 'bridge-lan', interface: 'ether3', disabled: 'false' },
        { bridge: 'bridge-lan', interface: 'ether4', disabled: 'true' }
      ]
    })

    expect(plan).toEqual({
      dhcpServerInterfaces: ['bridge-lan', 'vlan100'],
      dhcpInterfaces: ['ether2', 'ether3', 'vlan100'],
      uplinkInterfaces: ['ether1', 'pppoe-out1'],
      interfaces: ['ether2', 'ether3', 'vlan100', 'ether1', 'pppoe-out1'],
      roleSources: [
        { name: 'ether2', role: 'dhcp', sourceInterface: 'bridge-lan' },
        { name: 'ether3', role: 'dhcp', sourceInterface: 'bridge-lan' },
        { name: 'vlan100', role: 'dhcp' },
        { name: 'ether1', role: 'uplink' },
        { name: 'pppoe-out1', role: 'uplink' }
      ]
    })
  })

  it('extracts default gateway interface from gateway-status fallback', () => {
    expect(extractDefaultGatewayInterfaces([{
      'dst-address': '0.0.0.0/0',
      'active': 'true',
      'gateway-status': '10.0.87.1 reachable via ether2'
    }])).toEqual(['ether2'])
  })

  it('parses RouterOS interface speeds to bps', () => {
    expect(parseInterfaceSpeedBps('1Gbps')).toBe(1_000_000_000)
    expect(parseInterfaceSpeedBps('100Mbps')).toBe(100_000_000)
    expect(parseInterfaceSpeedBps('2.5G')).toBe(2_500_000_000)
    expect(parseInterfaceSpeedBps('10G-baseT')).toBe(10_000_000_000)
    expect(parseInterfaceSpeedBps('unknown')).toBeUndefined()
  })

  it('resolves VLAN interface speed from parent interfaces', () => {
    const directSpeeds = new Map([
      ['sfp-sfpplus1', 10_000_000_000],
      ['ether1', 1_000_000_000]
    ])
    const vlanParents = extractVlanParentInterfaces([
      { name: 'V120', interface: 'sfp-sfpplus1', disabled: 'false' },
      { name: 'V120-client', interface: 'V120', disabled: 'false' },
      { name: 'V130', interface: '*5', disabled: 'false' },
      { name: 'V130-disabled', interface: 'ether1', disabled: 'true' }
    ], new Map([['*5', 'ether1']]))

    expect(resolveInterfaceSpeedBps('V120', directSpeeds, vlanParents)).toBe(10_000_000_000)
    expect(resolveInterfaceSpeedBps('V120-client', directSpeeds, vlanParents)).toBe(10_000_000_000)
    expect(resolveInterfaceSpeedBps('V130', directSpeeds, vlanParents)).toBe(1_000_000_000)
    expect(resolveInterfaceSpeedBps('V130-disabled', directSpeeds, vlanParents)).toBeUndefined()
  })

  it('resolves VLAN interface speed from bridge parent ports', () => {
    const directSpeeds = new Map([
      ['sfp-sfpplus1', 10_000_000_000],
      ['sfp-sfpplus2', 10_000_000_000]
    ])
    const vlanParents = extractVlanParentInterfaces([
      { name: 'V102', interface: 'bridge-uplink', disabled: 'false' }
    ])
    const bridgePorts = extractBridgePortInterfaces([
      { bridge: 'bridge-uplink', interface: 'sfp-sfpplus1', disabled: 'false' },
      { bridge: 'bridge-uplink', interface: 'sfp-sfpplus2', disabled: 'false' },
      { bridge: 'bridge-uplink', interface: 'sfp-sfpplus3', disabled: 'true' }
    ])

    expect(resolveInterfaceSpeedBps('V102', directSpeeds, vlanParents, bridgePorts)).toBe(20_000_000_000)
  })
})

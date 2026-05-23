import { describe, expect, it } from 'vitest'
import { buildNetflowInterfaceRoleMaps, routerOsIdToIfIndex } from './interface-roles'

describe('NetFlow interface roles', () => {
  it('keeps latest role mappings and falls back to DHCP bridge ifIndex values from raw RouterOS data', () => {
    const roles = buildNetflowInterfaceRoleMaps([
      {
        equipmentId: 'router-1',
        runType: 'netflow-config',
        result: {
          data: {
            interfaceRoles: [
              { name: 'ether2', role: 'dhcp', sourceInterface: 'bridge-lan', ifIndex: 2, speedBps: 1_000_000_000 },
              { name: 'uplink-vlan', role: 'uplink', ifIndex: 31 }
            ],
            raw: {
              dhcpServers: [{ name: 'dhcp-lan', interface: 'bridge-lan', disabled: 'false' }],
              routerInterfaces: [
                { '.id': '*14', 'name': 'bridge-lan' },
                { '.id': '*1F', 'name': 'uplink-vlan' }
              ]
            }
          }
        }
      }
    ], [{ id: 'router-1', managementIp: '10.0.222.4', hostname: null }])

    expect(roles.get('10.0.222.4')?.get(2)).toMatchObject({
      name: 'ether2',
      role: 'dhcp',
      sourceInterface: 'bridge-lan',
      speedBps: 1_000_000_000
    })
    expect(roles.get('10.0.222.4')?.get(20)).toMatchObject({
      name: 'bridge-lan',
      role: 'dhcp',
      speedBps: 1_000_000_000
    })
    expect(roles.get('10.0.222.4')?.get(31)).toMatchObject({
      name: 'uplink-vlan',
      role: 'uplink'
    })
  })

  it('parses RouterOS hexadecimal ids as NetFlow ifIndex-compatible integers', () => {
    expect(routerOsIdToIfIndex('*1F')).toBe(31)
    expect(routerOsIdToIfIndex('*F00018')).toBe(15_728_664)
    expect(routerOsIdToIfIndex('bad')).toBeUndefined()
  })
})

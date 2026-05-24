import { describe, expect, it } from 'vitest'
import { buildFtthIpHostPlan, buildFtthMacMapPlan, buildFtthOnuPlan } from './import-planner'

describe('FTTH import planner', () => {
  it('plans create and update actions for imported Dasan ONUs', () => {
    expect(buildFtthOnuPlan([
      { oltPort: '1', onuId: '8', status: 'Active', serialNumber: 'HALN08196530' },
      { oltPort: '1', onuId: '9', status: 'Inactive', serialNumber: 'HALN08196531' }
    ], [{
      id: 'onu-8',
      oltPort: '1',
      onuId: '8',
      serialNumber: 'HALN08196530'
    }])).toMatchObject([
      { action: 'update', entity: 'ftthOnu', key: '1/8' },
      { action: 'create', entity: 'ftthOnu', key: '1/9' }
    ])
  })

  it('plans IP-host updates only for known ONUs', () => {
    expect(buildFtthIpHostPlan([
      { oltPort: '1', onuId: '8', hostId: '1', macAddress: '54:db:a2:18:ce:98', currentIp: '10.40.0.242' },
      { oltPort: '1', onuId: '99', hostId: '1', macAddress: '54:db:a2:18:ce:99', currentIp: '10.40.0.243' }
    ], [{
      id: 'onu-8',
      oltPort: '1',
      onuId: '8'
    }])).toMatchObject([
      { action: 'update', entity: 'ftthOnuIpHost', key: '1/8/1' },
      { action: 'skip', entity: 'ftthOnuIpHost', key: '1/99/1' }
    ])
  })

  it('adds a network equipment action for verified transparent ONUs when an OLT inventory id is available', () => {
    const actions = buildFtthMacMapPlan([
      { oltPort: '1', onuId: '8', macAddress: 'AA:BB:CC:00:00:01', vlanId: '100', status: 'dynamic' },
      { oltPort: '1', onuId: '8', macAddress: 'AA:BB:CC:00:00:02', vlanId: '100', status: 'dynamic' }
    ], [{
      id: 'onu-8',
      oltPort: '1',
      onuId: '8'
    }], [], [], '400', 'OLT-001')

    expect(actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'update', entity: 'ftthOnu', key: '1:8' }),
      expect.objectContaining({ action: 'update', entity: 'networkEquipment', key: 'OLT-001-ONU-1-8' })
    ]))
  })

  it('ignores VLAN 400 management MACs and links known downstream MACs behind transparent ONUs', () => {
    const actions = buildFtthMacMapPlan([
      { oltPort: '1', onuId: '8', macAddress: '54:DB:A2:18:CE:98', vlanId: '400', status: 'dynamic' },
      { oltPort: '1', onuId: '8', macAddress: 'AA:BB:CC:00:00:01', vlanId: '100', status: 'dynamic' },
      { oltPort: '1', onuId: '8', macAddress: 'AA:BB:CC:00:00:02', vlanId: '100', status: 'dynamic' }
    ], [{
      id: 'onu-8',
      oltPort: '1',
      onuId: '8'
    }], [{
      macAddress: 'aa:bb:cc:00:00:01',
      type: 'CUSTOMER_DEVICE_BEHIND_ONU',
      targetId: 'customer-device-1'
    }], ['54:db:a2:18:ce:98'])

    expect(actions).toMatchObject([
      { action: 'update', entity: 'ftthOnuMac', data: { managementVlan: true } },
      { action: 'update', entity: 'ftthOnuMac', data: { managementVlan: false } },
      { action: 'update', entity: 'ftthOnuMac', data: { managementVlan: false } },
      { action: 'update', entity: 'ftthOnu', data: { downstreamMacs: ['aa:bb:cc:00:00:01', 'aa:bb:cc:00:00:02'] } },
      { action: 'link', entity: 'ftthTransparentLink', data: { link: { targetId: 'customer-device-1' } } }
    ])
  })

  it('accepts known ONU status used by active-only FTTH import filtering', () => {
    const actions = buildFtthOnuPlan([
      { oltPort: '1', onuId: '8', status: 'Active', serialNumber: 'HALN08196530' }
    ], [{
      id: 'onu-8',
      oltPort: '1',
      onuId: '8',
      serialNumber: 'HALN08196530',
      status: 'active'
    }])

    expect(actions[0]?.data.ftthOnuId).toBe('onu-8')
  })

  it('keeps imported RX power in ONU action data', () => {
    const actions = buildFtthOnuPlan([
      { oltPort: '1', onuId: '8', status: 'Active', serialNumber: 'HALN08196530', signalRx: '-20.10 dBm' }
    ], [])

    expect(actions[0]?.data.onu).toMatchObject({ signalRx: '-20.10 dBm' })
  })
})

import { describe, expect, it } from 'vitest'
import { filterLeasesBySelectedNetworks, isIpInCidr } from './ip-network'

describe('ip-network', () => {
  it('matches IPv4 addresses against CIDR ranges', () => {
    expect(isIpInCidr('10.0.0.42', '10.0.0.0/24')).toBe(true)
    expect(isIpInCidr('10.0.1.42', '10.0.0.0/24')).toBe(false)
    expect(isIpInCidr('not-an-ip', '10.0.0.0/24')).toBe(false)
  })

  it('filters leases by selected networks', () => {
    const leases = [
      { address: '10.0.0.10', macAddress: 'AA:AA:AA:AA:AA:AA' },
      { address: '10.0.1.10', macAddress: 'BB:BB:BB:BB:BB:BB' },
      { address: '192.168.1.10', macAddress: 'CC:CC:CC:CC:CC:CC' }
    ]

    expect(filterLeasesBySelectedNetworks(leases, ['10.0.0.0/24', '192.168.1.0/24'])).toHaveLength(2)
    expect(filterLeasesBySelectedNetworks(leases, [])).toHaveLength(3)
  })
})

import { DasanDriver } from './dasan.driver'
import { MikrotikDriver } from './mikrotik.driver'
import { MockNetworkDriver } from './mock.driver'
import type { DriverEquipment, NetworkManagementDriver } from './types'

export function createNetworkDriver(driverCode: string | null | undefined, equipment: DriverEquipment): NetworkManagementDriver {
  switch (driverCode) {
    case 'mikrotik_v7':
      return new MikrotikDriver(equipment)
    case 'dasan_nos':
      return new DasanDriver(equipment)
    case 'mock':
    case 'snmp_generic':
    case 'ssh_generic':
    case 'http_api':
    case 'tr069':
    case 'netconf':
    default:
      return new MockNetworkDriver()
  }
}

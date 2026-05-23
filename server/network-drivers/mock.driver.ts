import type {
  DriverCheckResult,
  DriverLease,
  DriverNetflowConfig,
  DriverOnuIpHost,
  DriverMacTableEntry,
  DriverNetwork,
  DriverOnu,
  DriverOnuScanOptions,
  NetworkManagementDriver,
  UpsertLeasePayload
} from './types'

export class MockNetworkDriver implements NetworkManagementDriver {
  code = 'mock'

  async ping(target: string): Promise<DriverCheckResult> {
    return { name: 'ping', status: 'ok', data: [{ address: target, status: 'UP', time: '100us', size: '56' }] }
  }

  async arpPing(target: string): Promise<DriverCheckResult> {
    return { name: 'arp-ping', status: 'ok', data: [{ address: target, status: 'UP', time: '120us', interface: 'bridge1' }] }
  }

  async getDhcpLease(macAddress: string): Promise<DriverCheckResult> {
    return {
      name: 'dhcp-lease',
      status: 'ok',
      data: { macAddress, address: '10.0.0.50', status: 'bound', lastSeen: '1h20m' }
    }
  }

  async getBridgeHost(macAddress: string): Promise<DriverCheckResult> {
    return { name: 'bridge-host', status: 'ok', data: [{ macAddress, interface: 'ether1', bridge: 'bridge1' }] }
  }

  async getSwitchFdb(macAddress: string): Promise<DriverCheckResult> {
    return { name: 'switch-fdb', status: 'ok', data: [{ macAddress, port: 'ether1', vlanId: '100' }] }
  }

  async getLeases(): Promise<DriverLease[]> {
    return [{
      id: '*1',
      address: '10.0.0.50',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      comment: '100 Kowalski Mic1',
      rateLimit: '300M/1000M',
      status: 'bound',
      server: 'dhcp-main',
      interface: 'bridge1'
    }]
  }

  async getActiveUsers() {
    return {
      totalLeases: 1,
      candidateLeases: 1,
      activeUsers: [{
        macAddress: 'AA:BB:CC:DD:EE:FF',
        ipAddress: '10.0.0.50',
        server: 'dhcp-main',
        serverInterface: 'bridge1',
        evidence: ['arp' as const, 'bridge-host' as const]
      }],
      evidenceCounts: {
        arp: 1,
        bridgeHost: 1,
        switchFdb: 0
      }
    }
  }

  async getNetworks(): Promise<DriverNetwork[]> {
    return [{ cidr: '10.0.0.0/24', gateway: '10.0.0.1', comment: 'LAN main' }]
  }

  async getOnus(_options: DriverOnuScanOptions = {}): Promise<DriverOnu[]> {
    return [{ oltPort: '1', onuId: '5', status: 'Active', serialNumber: 'HALN08196530', uptime: '16:05:55:37', signalRx: '-20.10 dBm' }]
  }

  async getOnuInfo(oltPort: string, onuId: string): Promise<DriverCheckResult> {
    return {
      name: 'onu-info',
      status: 'ok',
      data: { oltPort, onuId, status: 'Active', serialNumber: 'HALN08196530', uptime: '16:05:55:37', signalRx: '-20.10 dBm' }
    }
  }

  async getOnuMacTable(oltPort: string, onuId: string): Promise<DriverMacTableEntry[]> {
    return [
      { oltPort, onuId, macAddress: 'AA:BB:CC:DD:EE:FF', vlanId: '100', status: 'dynamic' },
      { oltPort, onuId, macAddress: '00:11:22:33:44:55', vlanId: '400', status: 'dynamic' }
    ]
  }

  async getOnuIpHosts(oltPort: string, onuId: string): Promise<DriverOnuIpHost[]> {
    return [{
      oltPort,
      onuId,
      hostId: '1',
      ipOption: 'DHCP',
      macAddress: '00:11:22:33:44:55',
      currentIp: '10.40.0.10',
      currentMask: '255.255.0.0',
      currentGateway: '10.40.0.1',
      hostName: 'IPHOST: WWW/XML/TR069'
    }]
  }

  async upsertDhcpLease(payload: UpsertLeasePayload): Promise<DriverCheckResult> {
    return { name: 'sync-lease', status: 'ok', data: payload }
  }

  async configureNetflow(config: DriverNetflowConfig): Promise<DriverCheckResult> {
    return {
      name: 'netflow-config',
      status: 'ok',
      data: {
        collector: { address: config.collector.split(':')[0], port: 2055, version: config.version || 'ipfix' },
        dhcpInterfaces: ['bridge1'],
        uplinkInterfaces: ['ether1'],
        interfaces: ['bridge1', 'ether1'],
        targetAction: 'unchanged'
      }
    }
  }

  async getCommandTree(): Promise<DriverCheckResult> {
    return {
      name: 'command-tree',
      status: 'unsupported',
      message: 'Driver mock nie udostępnia drzewa komend'
    }
  }
}

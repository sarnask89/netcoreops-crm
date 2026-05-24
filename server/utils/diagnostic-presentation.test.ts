import { describe, expect, it } from 'vitest'
import { presentDiagnostics } from './diagnostic-presentation'

describe('diagnostic presentation', () => {
  it('turns raw driver checks into operator-facing rows with recommendations', () => {
    const presentation = presentDiagnostics({
      title: 'Ping / ARP / DHCP',
      target: { macAddress: 'AA:BB:CC:00:00:01', ipAddress: '10.0.0.10' },
      checks: [{
        name: 'dhcp-lease',
        status: 'ok',
        data: [{ address: '10.0.0.10' }]
      }, {
        name: 'arp-ping',
        status: 'error',
        message: 'timeout'
      }]
    })

    expect(presentation).toMatchObject({
      status: 'ok',
      title: 'Ping / ARP / DHCP',
      target: 'AA:BB:CC:00:00:01 / 10.0.0.10',
      rows: [{
        name: 'dhcp-lease',
        status: 'ok',
        summary: '1 znalezionych wpisów',
        recommendation: 'Nie wymaga działania'
      }, {
        name: 'arp-ping',
        status: 'error',
        summary: 'timeout',
        recommendation: 'Sprawdź dostęp do urządzenia, poświadczenia i parametry testu'
      }]
    })
  })
})

import { describe, expect, it } from 'vitest'
import { enrichMikrotikLeaseImport } from './import-enrichment'

describe('MikroTik import enrichment', () => {
  it('extracts customer, address and tariff data from a lease comment', () => {
    const result = enrichMikrotikLeaseImport({
      address: '10.0.0.25',
      macAddress: 'aa:bb:cc:dd:ee:ff',
      comment: '1825 Krupka M/33 Mic25',
      rateLimit: '300M/1000M'
    }, {
      terytAreaId: 1,
      simcLocalityId: 2,
      streetId: 3,
      label: 'ul. Adama Mickiewicza 25/33, Sandomierz'
    })

    expect(result).toMatchObject({
      customerName: 'Abonent Krupka',
      displayAddress: 'ul. Adama Mickiewicza 25/33, Sandomierz',
      hostname: 'krupka-aabbccddeeff.netcoreops',
      tariffName: 'Import 1000/300 Mbps',
      issues: [],
      isReady: true,
      parsed: {
        externalId: '1825',
        lastName: 'Krupka',
        streetName: 'Adama Mickiewicza',
        streetNumber: '25',
        apartmentNumber: '33'
      }
    })
  })

  it('keeps importable data and marks missing dictionary matches', () => {
    const result = enrichMikrotikLeaseImport({
      address: '10.0.0.26',
      macAddress: 'aa:bb:cc:dd:ee:01',
      comment: '1826 Nowak Xyz99'
    }, null)

    expect(result.customerName).toBe('Abonent Nowak')
    expect(result.displayAddress).toBe('Xyz99')
    expect(result.issues).toContain('Brak dopasowania ulicy: Xyz')
    expect(result.isReady).toBe(false)
  })

  it('marks MAC conflicts without losing parsed comment data', () => {
    const result = enrichMikrotikLeaseImport({
      address: '10.0.0.27',
      macAddress: 'aa:bb:cc:dd:ee:02',
      comment: '1827 Krupka Mic25'
    }, {
      terytAreaId: 1,
      simcLocalityId: 2,
      streetId: 3,
      label: 'ul. Adama Mickiewicza 25, Sandomierz'
    }, 'existing-device-id')

    expect(result.parsed?.externalId).toBe('1827')
    expect(result.conflict).toBe(true)
    expect(result.issues).toContain('Konflikt MAC z istniejącym urządzeniem')
  })
})

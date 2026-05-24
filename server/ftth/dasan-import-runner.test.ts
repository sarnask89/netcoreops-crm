import { describe, expect, it } from 'vitest'
import { selectDasanImportOnus } from './dasan-import-runner'

describe('Dasan import runner', () => {
  const onus = [
    { id: 'onu-10', oltPort: '1', onuId: '10', status: 'active' },
    { id: 'onu-2', oltPort: '1', onuId: '2', status: 'active' },
    { id: 'onu-1', oltPort: '1', onuId: '1', status: 'inactive' },
    { id: 'onu-3', oltPort: '1', onuId: '3', status: 'active' },
    { id: 'onu-4', oltPort: '1', onuId: '4', status: 'active' }
  ]

  it('selects a stable one-based range after active filtering and ONU sorting', () => {
    expect(selectDasanImportOnus(onus, {
      activeOnly: true,
      rangeFrom: 2,
      rangeTo: 3
    }).map(onu => onu.id)).toEqual(['onu-3', 'onu-4'])
  })

  it('keeps legacy limit selection as a first-page fallback', () => {
    expect(selectDasanImportOnus(onus, {
      activeOnly: true,
      limit: 2
    }).map(onu => onu.id)).toEqual(['onu-2', 'onu-3'])
  })
})

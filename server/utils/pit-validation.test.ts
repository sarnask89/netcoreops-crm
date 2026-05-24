import { describe, expect, it } from 'vitest'
import {
  formatPitValidationReport,
  isSevenDigitCode,
  validatePitReadiness
} from './pit-validation'

describe('PIT validation helpers', () => {
  it('accepts only seven digit TERYT/SIMC codes and preserves leading zeros', () => {
    expect(isSevenDigitCode('0123456')).toBe(true)
    expect(isSevenDigitCode('123456')).toBe(false)
    expect(isSevenDigitCode('12345678')).toBe(false)
    expect(isSevenDigitCode('ABC1234')).toBe(false)
  })

  it('reports CPE without a powering node', () => {
    const report = validatePitReadiness({
      nodes: [],
      lines: [],
      equipment: [{
        id: 'eq-1',
        inventoryId: 'CPE-001',
        equipmentRole: 'CLIENT_PE',
        nodeId: null,
        status: 'IN_USE'
      }],
      services: []
    })

    expect(report.errors).toContainEqual(expect.objectContaining({
      entity: 'networkEquipment',
      entityId: 'eq-1',
      code: 'CPE_WITHOUT_NODE'
    }))
  })

  it('reports services without customer/profile and invalid service TERYT', () => {
    const report = validatePitReadiness({
      nodes: [],
      lines: [],
      equipment: [],
      services: [{
        id: 'svc-1',
        customerId: null,
        profileId: null,
        serviceAddressTeryt: '123456',
        status: 'ACTIVE'
      }]
    })

    expect(report.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SERVICE_WITHOUT_CUSTOMER' }),
      expect.objectContaining({ code: 'SERVICE_WITHOUT_PROFILE' }),
      expect.objectContaining({ code: 'INVALID_SERVICE_TERYT' })
    ]))
  })

  it('reports lines without both endpoints and nodes with invalid reference codes', () => {
    const report = validatePitReadiness({
      nodes: [{
        id: 'node-1',
        inventoryId: 'NODE-001',
        terytCode: '123456',
        simcCode: '0123456',
        status: 'ACTIVE'
      }],
      lines: [{
        id: 'line-1',
        inventoryId: 'LINE-001',
        nodeStartId: 'node-1',
        nodeEndId: null,
        status: 'ACTIVE'
      }],
      equipment: [],
      services: []
    })

    expect(report.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'INVALID_NODE_TERYT' }),
      expect.objectContaining({ code: 'LINE_WITHOUT_ENDPOINTS' })
    ]))
  })

  it('formats report summary for API responses', () => {
    const report = formatPitValidationReport({
      errors: [{ severity: 'error', entity: 'x', entityId: '1', code: 'E', message: 'Error' }],
      warnings: [{ severity: 'warning', entity: 'x', entityId: '2', code: 'W', message: 'Warn' }]
    })

    expect(report.summary).toEqual({
      errors: 1,
      warnings: 1,
      readyForExport: false
    })
  })
})

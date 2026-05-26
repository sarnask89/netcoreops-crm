import { describe, expect, it } from 'vitest'
import { filterDashboardFunctionSearchItems, normalizeDashboardSearchTerm } from './dashboard-search'

describe('dashboard-search', () => {
  it('normalizes @ database search terms', () => {
    expect(normalizeDashboardSearchTerm('@ crm ')).toBe('crm')
    expect(normalizeDashboardSearchTerm('automation')).toBe('automation')
  })

  it('finds automation variable definitions by aliases', () => {
    const results = filterDashboardFunctionSearchItems('@ variables')

    expect(results.some(item => item.to === '/automation/definitions')).toBe(true)
  })

  it('finds useful CRM and network routes', () => {
    expect(filterDashboardFunctionSearchItems('@ customers').some(item => item.to === '/crm/customers')).toBe(true)
    expect(filterDashboardFunctionSearchItems('@ equipment').some(item => item.to === '/network/equipment')).toBe(true)
  })

  it('finds dictionary and PIT functions', () => {
    expect(filterDashboardFunctionSearchItems('@ teryt').some(item => item.to === '/system/dictionaries')).toBe(true)
    expect(filterDashboardFunctionSearchItems('@ validation').some(item => item.to === '/pit/validation')).toBe(true)
  })

  it('does not return function items for an empty term', () => {
    expect(filterDashboardFunctionSearchItems('@')).toEqual([])
  })
})

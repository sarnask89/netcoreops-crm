import { describe, expect, it } from 'vitest'
import {
  ALL_SECTION_KEYS,
  canAccessSection,
  filterNavigationItems,
  filterRowContextItems,
  sectionForPath
} from './access-control'

describe('RBAC access control', () => {
  it('maps portal paths to sections', () => {
    expect(sectionForPath('/network/ftth/mac-map')).toBe('network.ftth')
    expect(sectionForPath('/api/crm/customers')).toBe('crm')
    expect(sectionForPath('/settings/members')).toBe('settings.users')
  })

  it('allows admin users and restricts regular users by section key', () => {
    expect(canAccessSection({ isAdmin: true, permissions: [] }, 'billing')).toBe(true)
    expect(canAccessSection({ isAdmin: false, permissions: ['crm'] }, 'crm')).toBe(true)
    expect(canAccessSection({ isAdmin: false, permissions: ['crm'] }, 'billing')).toBe(false)
  })

  it('filters navigation groups and keeps parents only when children remain', () => {
    const filtered = filterNavigationItems([[{
      label: 'Sieć',
      section: 'network',
      children: [
        { label: 'Urządzenia', section: 'network' },
        { label: 'ONU', section: 'network.ftth' }
      ]
    }, {
      label: 'CRM',
      section: 'crm'
    }]], { isAdmin: false, permissions: ['network.ftth'] })

    expect(filtered).toEqual([[{
      label: 'Sieć',
      section: 'network',
      children: [{ label: 'ONU', section: 'network.ftth' }]
    }]])
  })

  it('removes row actions unavailable to the current role', () => {
    const filtered = filterRowContextItems([[{
      label: 'Szczegóły',
      permission: 'network:read'
    }, {
      label: 'Usuń',
      permission: 'network:delete'
    }]], {
      isAdmin: false,
      permissions: ['network'],
      actions: ['network:read']
    })

    expect(filtered).toEqual([[{
      label: 'Szczegóły',
      permission: 'network:read'
    }]])
  })

  it('has stable permission keys for every visible portal section', () => {
    expect(ALL_SECTION_KEYS).toContain('dashboard')
    expect(ALL_SECTION_KEYS).toContain('settings.users')
    expect(new Set(ALL_SECTION_KEYS).size).toBe(ALL_SECTION_KEYS.length)
  })
})

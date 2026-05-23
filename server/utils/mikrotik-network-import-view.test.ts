import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('MikroTik network import UI', () => {
  it('shows MikroTik import actions for RouterOS equipment even when driver code is missing', () => {
    const page = readFileSync('app/pages/network/imports.vue', 'utf8')

    expect(page).toContain('isMikrotikDevice')
    expect(page).not.toContain('selectedDriver === \'mikrotik_v7\'')
    expect(page).toContain('Importuj DHCP networks')
  })

  it('has a MikroTik networks endpoint that writes to the IP networks model', () => {
    const endpoint = 'server/api/import/mikrotik/[equipmentId]/networks.post.ts'

    expect(existsSync(endpoint)).toBe(true)
    expect(readFileSync(endpoint, 'utf8')).toContain('ipNetworks')
  })

  it('does not hydrate heavy global system options on import pages', () => {
    const importPages = [
      'app/pages/network/imports.vue',
      'app/pages/network/ftth/imports.vue',
      'app/pages/network/ftth/diagnostics.vue'
    ]

    for (const pagePath of importPages) {
      const page = readFileSync(pagePath, 'utf8')

      expect(page).toContain('/api/network/import-options')
      expect(page).not.toContain('/api/system/options')
    }
  })

  it('does not hydrate full FTTH ONU details on FTTH import page', () => {
    const page = readFileSync('app/pages/network/ftth/imports.vue', 'utf8')

    expect(page).toContain('/api/ftth/imports/options')
    expect(page).not.toContain('/api/ftth/onuses')
  })

  it('checks MAC conflicts before creating DHCP import customers', () => {
    const importer = readFileSync('server/utils/import-actions.ts', 'utf8')
    const existingDeviceCheck = importer.indexOf('if (existingDevice) {')
    const customerCreation = importer.indexOf('const customer = await findOrCreateCustomer')

    expect(existingDeviceCheck).toBeGreaterThan(0)
    expect(customerCreation).toBeGreaterThan(0)
    expect(existingDeviceCheck).toBeLessThan(customerCreation)
  })
})

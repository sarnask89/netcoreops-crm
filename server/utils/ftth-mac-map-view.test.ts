import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('FTTH MAC map view', () => {
  it('has an API endpoint for raw imported ONU MAC table rows', () => {
    expect(existsSync('server/api/ftth/mac-map/index.get.ts')).toBe(true)
  })

  it('renders imported ftth_onu_macs rows instead of only transparent links', () => {
    const page = readFileSync('app/pages/network/ftth/mac-map.vue', 'utf8')
    expect(page).toContain('\'/api/ftth/mac-map\'')
    expect(page).not.toContain('\'/api/ftth/transparent-links\'')
    expect(page).toContain('vlanId')
    expect(page).toContain('transparentLink')
  })
})

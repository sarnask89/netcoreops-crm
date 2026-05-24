import { describe, expect, it } from 'vitest'
import { GPON_RX_REFRESH_SCRIPT_BODY } from './gpon-rx-script-template'

describe('GPON RX automation script template', () => {
  it('stores the GPON RX refresh and alerting logic in the script body', () => {
    expect(GPON_RX_REFRESH_SCRIPT_BODY).toContain('driver.getOnus({ activeOnly: true })')
    expect(GPON_RX_REFRESH_SCRIPT_BODY).toContain('diagnosticRuns')
    expect(GPON_RX_REFRESH_SCRIPT_BODY).toContain('classifyGponRx')
    expect(GPON_RX_REFRESH_SCRIPT_BODY).not.toContain('netcoreops-gpon-rx-refresh')
  })
})

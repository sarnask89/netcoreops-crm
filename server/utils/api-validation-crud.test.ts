import { describe, expect, it } from 'vitest'
import {
  updateAccessProfileSchema,
  updateAutomationScriptSchema,
  updateEquipmentSchema,
  updateLineSchema,
  updateNodeSchema,
  updateSubscriptionSchema,
  updateTariffSchema
} from './api-validation'

describe('CRUD update schemas', () => {
  it('allow partial payloads for editable portal records', () => {
    expect(updateNodeSchema.parse({ name: 'POP Sandomierz' })).toEqual({ name: 'POP Sandomierz' })
    expect(updateLineSchema.parse({ status: 'DECOMMISSIONED' })).toEqual({ status: 'DECOMMISSIONED' })
    expect(updateEquipmentSchema.parse({ hostname: 'olt-01', managementPort: 22 })).toEqual({ hostname: 'olt-01', managementPort: 22 })
    expect(updateAccessProfileSchema.parse({ defaultProtocol: 'routeros' })).toEqual({ defaultProtocol: 'routeros' })
    expect(updateTariffSchema.parse({ defaultNetPrice: '99.99' })).toEqual({ defaultNetPrice: 99.99 })
    expect(updateSubscriptionSchema.parse({ status: 'SUSPENDED' })).toEqual({ status: 'SUSPENDED' })
    expect(updateAutomationScriptSchema.parse({ isEnabled: true })).toEqual({ isEnabled: true })
  })

  it('keeps validation on partial payloads', () => {
    expect(() => updateNodeSchema.parse({ status: 'BROKEN' })).toThrow()
    expect(() => updateEquipmentSchema.parse({ managementPort: 70000 })).toThrow()
    expect(() => updateTariffSchema.parse({ vatRate: 101 })).toThrow()
    expect(() => updateAutomationScriptSchema.parse({ timeoutSeconds: 0 })).toThrow()
  })
})

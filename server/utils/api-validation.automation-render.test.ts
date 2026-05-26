import { describe, expect, it } from 'vitest'
import { renderAutomationScriptSchema } from './api-validation'

describe('renderAutomationScriptSchema', () => {
  it('defaults missing variables to an empty object', () => {
    expect(renderAutomationScriptSchema.parse({})).toEqual({ variables: {} })
  })

  it('accepts string variable overrides', () => {
    expect(renderAutomationScriptSchema.parse({
      variables: {
        userip: '10.0.0.10',
        usermac: 'AA:BB:CC:DD:EE:FF'
      }
    })).toEqual({
      variables: {
        userip: '10.0.0.10',
        usermac: 'AA:BB:CC:DD:EE:FF'
      }
    })
  })

  it('rejects non-string variable override values', () => {
    expect(() => renderAutomationScriptSchema.parse({
      variables: {
        enabled: true
      }
    })).toThrow()
  })
})

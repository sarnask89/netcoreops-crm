import { describe, expect, it } from 'vitest'
import { classifyGponRx, defaultGponRxThresholds, parseSignalRxDbm } from './gpon-rx-monitor'

describe('GPON RX monitor', () => {
  it('parses signal RX values returned by OLT commands', () => {
    expect(parseSignalRxDbm('-20.10 dBm')).toBe(-20.1)
    expect(parseSignalRxDbm('Rx Power : -23.1200 dBm')).toBe(-23.12)
    expect(parseSignalRxDbm('Unknown')).toBeNull()
  })

  it('classifies ONU RX power using GPON B+ operator thresholds', () => {
    const thresholds = defaultGponRxThresholds()

    expect(classifyGponRx('-20.10 dBm', thresholds)).toMatchObject({
      status: 'normal',
      severity: null
    })
    expect(classifyGponRx('-26.10 dBm', thresholds)).toMatchObject({
      status: 'warning-low',
      severity: 'warning'
    })
    expect(classifyGponRx('-28.44 dBm', thresholds)).toMatchObject({
      status: 'critical-low',
      severity: 'critical'
    })
    expect(classifyGponRx('-7.90 dBm', thresholds)).toMatchObject({
      status: 'critical-high',
      severity: 'critical'
    })
  })
})

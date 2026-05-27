import { describe, expect, it } from 'vitest'
import { normalizeAiModuleDefinition, parseAiModuleJson } from './module-generator-ai'

describe('module generator AI normalization', () => {
  it('turns a noisy Ollama draft into a validator-safe module definition', () => {
    const definition = normalizeAiModuleDefinition({
      module: 'GPON-SLA Monitor',
      title: 'GPON SLA Monitor',
      tableName: 'gpon sla monitor',
      route: 'network/../gpon-monitor',
      page: 'app/pages/gpon_monitor.vue',
      timestamps: true,
      fields: [
        { name: 'id', label: 'ID', type: 'uuid' },
        { name: 'slaState', label: 'SLA State', type: 'enum' },
        { name: 'rxPowerDbm', label: 'RX Power dBm', type: 'decimal', required: true },
        { name: 'evidenceSnapshot', label: 'Evidence Snapshot', type: 'object' },
        { name: 'slaState', label: 'Duplicate State', type: 'text' }
      ]
    })

    expect(definition).toMatchObject({
      module: 'gponSlaMonitor',
      tableName: 'gpon_sla_monitor',
      route: 'network/gpon-monitor',
      page: 'gpon-monitor'
    })
    expect(definition.fields.map(field => field.name)).toEqual(['slaState', 'rxPowerDbm', 'evidenceSnapshot'])
    expect(definition.fields.find(field => field.name === 'slaState')).toMatchObject({
      type: 'enum',
      values: ['ACTIVE', 'INACTIVE']
    })
    expect(definition.fields.find(field => field.name === 'rxPowerDbm')).toMatchObject({
      type: 'number'
    })
    expect(definition.fields.find(field => field.name === 'evidenceSnapshot')).toMatchObject({
      type: 'json'
    })
  })

  it('parses JSON output and supplies a minimal field if the model forgets fields', () => {
    const definition = parseAiModuleJson(JSON.stringify({
      module: 'Tiny Tool',
      title: 'Tiny Tool',
      tableName: 'tiny tool',
      route: 'tools/tiny-tool',
      fields: []
    }))

    expect(definition.module).toBe('tinyTool')
    expect(definition.fields).toEqual([
      expect.objectContaining({ name: 'name', type: 'varchar', required: true })
    ])
  })
})

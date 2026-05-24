import { describe, expect, it } from 'vitest'
import { renderAutomationTemplate } from './automation-render'

describe('automation-render', () => {
  it('renders moustache variables', () => {
    expect(renderAutomationTemplate('lease {{ userip }} {{usermac}}', {
      userip: '10.0.0.10',
      usermac: 'AA:BB:CC:DD:EE:FF'
    })).toBe('lease 10.0.0.10 AA:BB:CC:DD:EE:FF')
  })

  it('renders handlebars-style conditional blocks', () => {
    expect(renderAutomationTemplate('{{#if deviceaccess=true}}allow {{userid}}{{/if}}', {
      deviceaccess: 'true',
      userid: 'CUST-1'
    })).toBe('allow CUST-1')

    expect(renderAutomationTemplate('{{#if deviceaccess=true}}allow{{/if}}', {
      deviceaccess: 'false'
    })).toBe('')
  })

  it('renders bracket-style conditional blocks', () => {
    expect(renderAutomationTemplate('if $deviceaccess=true [rate-limit {{tarupload}}/{{tardownload}}]', {
      deviceaccess: 'true',
      tarupload: '20M',
      tardownload: '100M'
    })).toBe('rate-limit 20M/100M')
  })

  it('omits falsey implicit conditional blocks', () => {
    expect(renderAutomationTemplate('{{#if enabled}}enabled{{/if}}', {
      enabled: 'no'
    })).toBe('')
  })
})

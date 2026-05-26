import { describe, expect, it } from 'vitest'
import { renderAutomationTemplate } from './automation-render'

describe('automation-render', () => {
  it('renders moustache variables', () => {
    expect(renderAutomationTemplate('lease {{ userip }} {{usermac}}', {
      userip: '10.0.0.10',
      usermac: 'AA:BB:CC:DD:EE:FF'
    })).toBe('lease 10.0.0.10 AA:BB:CC:DD:EE:FF')
  })

  it('renders missing moustache variables as empty strings', () => {
    expect(renderAutomationTemplate('lease {{missing}} done', {})).toBe('lease  done')
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

  it('supports quoted handlebars conditional values', () => {
    expect(renderAutomationTemplate('{{#if profile="premium"}}queue {{userid}}{{/if}}', {
      profile: 'premium',
      userid: 'CUST-1'
    })).toBe('queue CUST-1')
  })

  it('renders bracket-style conditional blocks', () => {
    expect(renderAutomationTemplate('if $deviceaccess=true [rate-limit {{tarupload}}/{{tardownload}}]', {
      deviceaccess: 'true',
      tarupload: '20M',
      tardownload: '100M'
    })).toBe('rate-limit 20M/100M')
  })

  it('omits false bracket-style conditional blocks', () => {
    expect(renderAutomationTemplate('if $deviceaccess=true [rate-limit {{tarupload}}/{{tardownload}}]', {
      deviceaccess: 'false',
      tarupload: '20M',
      tardownload: '100M'
    })).toBe('')
  })

  it('omits falsey implicit conditional blocks', () => {
    expect(renderAutomationTemplate('{{#if enabled}}enabled{{/if}}', {
      enabled: 'no'
    })).toBe('')
  })
})

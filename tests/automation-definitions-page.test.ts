import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const definitionsPage = 'app/pages/automation/definitions.vue'

describe('automation variable definitions page contract', () => {
  it('loads variable definitions and source catalog endpoints', () => {
    const page = readFileSync(definitionsPage, 'utf8')

    expect(page).toContain("/api/automation/variables")
    expect(page).toContain("/api/automation/variables/sources")
    expect(page).toContain('interface SourceCatalogEntry')
    expect(page).toContain('lookupColumns')
    expect(page).toContain('fields')
  })

  it('keeps supported variable value types visible in the form', () => {
    const page = readFileSync(definitionsPage, 'utf8')

    expect(page).toContain("'string'")
    expect(page).toContain("'int'")
    expect(page).toContain("'date'")
    expect(page).toContain("'bool'")
  })

  it('keeps static and database variable source forms separated', () => {
    const page = readFileSync(definitionsPage, 'utf8')

    expect(page).toContain("['DATABASE', 'STATIC']")
    expect(page).toContain("variableState.sourceType === 'DATABASE'")
    expect(page).toContain('rowLookupColumn')
    expect(page).toContain('rowLookupValue')
    expect(page).toContain('fieldName')
    expect(page).toContain('staticValue')
  })

  it('uses AppDataTable row context actions instead of visible action columns', () => {
    const page = readFileSync(definitionsPage, 'utf8')

    expect(page).toContain('function rowContextItems')
    expect(page).toContain('Edytuj definicję')
    expect(page).toContain('Szczegóły definicji')
    expect(page).toContain(':context-items="rowContextItems"')
    expect(page).not.toContain("id: 'actions'")
  })
})

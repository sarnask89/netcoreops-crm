import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const scriptsPage = 'app/pages/automation/scripts.vue'

describe('automation scripts editor contract', () => {
  it('loads automation variable definitions for editor insert menus', () => {
    const page = readFileSync(scriptsPage, 'utf8')

    expect(page).toContain("/api/automation/variables")
    expect(page).toContain('interface VariableDefinition')
    expect(page).toContain('variableName')
    expect(page).toContain('valueType')
  })

  it('exposes right-click menu items for variables and conditional placeholders', () => {
    const page = readFileSync(scriptsPage, 'utf8')

    expect(page).toContain('const scriptContextItems')
    expect(page).toContain('i-lucide-braces')
    expect(page).toContain('i-lucide-git-branch')
    expect(page).toContain('{{${variable.variableName}}}')
    expect(page).toContain('if $${variable.variableName}=true [  ]')
  })

  it('wraps the script textarea in a Nuxt UI context menu', () => {
    const page = readFileSync(scriptsPage, 'utf8')

    expect(page).toContain('<UContextMenu :items="scriptContextItems">')
    expect(page).toContain('<UTextarea v-model="scriptState.scriptBody"')
  })

  it('keeps render preview wired to the dedicated render endpoint', () => {
    const page = readFileSync(scriptsPage, 'utf8')

    expect(page).toContain('async function renderScript()')
    expect(page).toContain('/render')
    expect(page).toContain('renderedBody')
    expect(page).toContain('renderedVariables')
  })
})

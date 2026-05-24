import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const editableResources = [
  {
    page: 'app/pages/network/nodes.vue',
    endpointBase: 'server/api/network/nodes',
    editLabel: 'Edytuj węzeł',
    deleteLabel: 'Usuń węzeł'
  },
  {
    page: 'app/pages/network/lines.vue',
    endpointBase: 'server/api/network/lines',
    editLabel: 'Edytuj linię',
    deleteLabel: 'Usuń linię'
  },
  {
    page: 'app/pages/network/equipment.vue',
    endpointBase: 'server/api/network/equipment',
    editLabel: 'Edytuj urządzenie',
    deleteLabel: 'Usuń urządzenie'
  },
  {
    page: 'app/pages/network/access-profiles.vue',
    endpointBase: 'server/api/network/access-profiles',
    editLabel: 'Edytuj profil',
    deleteLabel: 'Usuń profil'
  },
  {
    page: 'app/pages/billing/tariffs.vue',
    endpointBase: 'server/api/billing/tariffs',
    editLabel: 'Edytuj taryfę',
    deleteLabel: 'Usuń taryfę'
  },
  {
    page: 'app/pages/billing/subscriptions.vue',
    endpointBase: 'server/api/billing/subscriptions',
    editLabel: 'Edytuj subskrypcję',
    deleteLabel: 'Usuń subskrypcję'
  },
  {
    page: 'app/pages/billing/assignments.vue',
    endpointBase: 'server/api/billing/assignments',
    editLabel: 'Edytuj przypisanie',
    deleteLabel: 'Usuń przypisanie'
  },
  {
    page: 'app/pages/automation/scripts.vue',
    endpointBase: 'server/api/automation/scripts',
    editLabel: 'Edytuj skrypt',
    deleteLabel: 'Usuń skrypt'
  }
]

describe('portal CRUD coverage', () => {
  it('has PATCH and DELETE endpoints for editable table resources', () => {
    for (const resource of editableResources) {
      expect(existsSync(`${resource.endpointBase}/[id].patch.ts`), resource.endpointBase).toBe(true)
      expect(existsSync(`${resource.endpointBase}/[id].delete.ts`), resource.endpointBase).toBe(true)
    }
  })

  it('exposes edit and delete actions through right-click context menu definitions', () => {
    for (const resource of editableResources) {
      const page = readFileSync(resource.page, 'utf8')
      expect(page, resource.page).toContain('function rowContextItems')
      expect(page, resource.page).toContain(resource.editLabel)
      expect(page, resource.page).toContain(resource.deleteLabel)
      expect(page, resource.page).toContain(':context-items="rowContextItems"')
    }
  })
})

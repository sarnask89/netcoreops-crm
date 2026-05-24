import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateModuleFiles } from './module-generator'

describe('module generator', () => {
  it('generates database, API and Vue files from JSON', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const definitionPath = join(rootDir, 'definition.json')

    await writeFile(definitionPath, JSON.stringify({
      module: 'helpdeskTickets',
      title: 'Zgloszenia',
      tableName: 'helpdesk_tickets',
      route: 'helpdesk/tickets',
      fields: [
        { name: 'subject', label: 'Temat', type: 'varchar', required: true, max: 180 },
        { name: 'status', label: 'Status', type: 'enum', values: ['OPEN', 'CLOSED'], default: 'OPEN' },
        { name: 'priority', label: 'Priorytet', type: 'integer', default: 0 },
        { name: 'isActive', label: 'Aktywne', type: 'boolean', default: true }
      ]
    }), 'utf8')

    const files = await generateModuleFiles({ rootDir, definitionPath })
    const paths = files.map(file => file.path)
    const migration = files.find(file => file.path.endsWith('.sql'))?.content || ''
    const page = files.find(file => file.path.endsWith('.vue'))?.content || ''

    expect(paths).toContain(join(rootDir, 'server/db/generated/helpdesk-tickets.ts'))
    expect(paths).toContain(join(rootDir, 'server/api/helpdesk/tickets/index.get.ts'))
    expect(paths).toContain(join(rootDir, 'app/pages/helpdesk/tickets.vue'))
    expect(migration).toContain('CREATE TABLE "helpdesk_tickets"')
    expect(migration).toContain('"subject" varchar(180) NOT NULL')
    expect(page).toContain(':context-items="rowContextItems"')
  })
})

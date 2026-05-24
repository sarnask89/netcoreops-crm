import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  generateModuleFiles,
  generateModulePlan,
  parseModuleDefinitionFile,
  validateGeneratedModuleFiles
} from './module-generator'

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

  it('parses XML definitions into the same canonical module format', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const definitionPath = join(rootDir, 'definition.xml')

    await writeFile(definitionPath, `<?xml version="1.0" encoding="UTF-8"?>
<moduleDefinition>
  <module>fiberTickets</module>
  <title>Awaria FTTH</title>
  <tableName>fiber_tickets</tableName>
  <route>network/fiber-tickets</route>
  <fields>
    <field name="subject" label="Temat" type="varchar" required="true" max="120" />
    <field name="status" label="Status" type="enum" default="OPEN">
      <values>
        <value>OPEN</value>
        <value>CLOSED</value>
      </values>
    </field>
  </fields>
</moduleDefinition>`, 'utf8')

    const definition = await parseModuleDefinitionFile(definitionPath)

    expect(definition.module).toBe('fiberTickets')
    expect(definition.fields).toEqual([
      expect.objectContaining({ name: 'subject', type: 'varchar', required: true, max: 120 }),
      expect.objectContaining({ name: 'status', type: 'enum', values: ['OPEN', 'CLOSED'], default: 'OPEN' })
    ])
  })

  it('builds a multi-module plan from JSON and XML inputs without writing files', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const jsonDefinition = join(rootDir, 'helpdesk.json')
    const xmlDefinition = join(rootDir, 'fiber.xml')

    await writeFile(jsonDefinition, JSON.stringify({
      module: 'helpdeskTickets',
      title: 'Zgloszenia',
      tableName: 'helpdesk_tickets',
      route: 'helpdesk/tickets',
      fields: [{ name: 'subject', type: 'varchar', required: true, max: 180 }]
    }), 'utf8')
    await writeFile(xmlDefinition, `<moduleDefinition>
  <module>fiberTickets</module>
  <title>Awaria FTTH</title>
  <tableName>fiber_tickets</tableName>
  <route>network/fiber-tickets</route>
  <fields><field name="subject" type="varchar" required="true" max="120" /></fields>
</moduleDefinition>`, 'utf8')

    const plan = await generateModulePlan({ rootDir, definitionPaths: [jsonDefinition, xmlDefinition] })

    expect(plan.modules).toHaveLength(2)
    expect(plan.files.some(file => file.path.endsWith('server/api/helpdesk/tickets/index.get.ts'))).toBe(true)
    expect(plan.files.some(file => file.path.endsWith('server/api/network/fiber-tickets/index.get.ts'))).toBe(true)
    expect(plan.validation.success).toBe(true)
  })

  it('reports generated file validation failures before writing', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const unsafePath = join(rootDir, 'server/api/helpdesk/tickets/index.get.ts')
    await writeFile(unsafePath, 'existing', 'utf8').catch(async () => {
      const { mkdir } = await import('node:fs/promises')
      await mkdir(join(rootDir, 'server/api/helpdesk/tickets'), { recursive: true })
      await writeFile(unsafePath, 'existing', 'utf8')
    })

    const report = await validateGeneratedModuleFiles([
      { path: unsafePath, content: 'new content', kind: 'api' }
    ], { force: false })

    expect(report.success).toBe(false)
    expect(report.errors[0]).toContain('Plik juz istnieje')
  })

  it('generates Nuxt UI forms with UForm and numeric/boolean specialized controls', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const definitionPath = join(rootDir, 'definition.json')

    await writeFile(definitionPath, JSON.stringify({
      module: 'deviceProfiles',
      title: 'Profile urzadzen',
      tableName: 'device_profiles',
      route: 'network/device-profiles',
      fields: [
        { name: 'name', type: 'varchar', required: true },
        { name: 'priority', type: 'integer' },
        { name: 'enabled', type: 'boolean', default: true }
      ]
    }), 'utf8')

    const files = await generateModuleFiles({ rootDir, definitionPath })
    const page = files.find(file => file.path.endsWith('.vue'))?.content || ''

    expect(page).toContain('<UForm')
    expect(page).toContain('<UInputNumber')
    expect(page).toContain('<USwitch')
    expect(page).toContain(':context-items="rowContextItems"')
  })
})

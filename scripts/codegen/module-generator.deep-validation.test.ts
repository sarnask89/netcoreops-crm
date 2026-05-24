import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseArgs } from '../generate-module'
import {
  parseModuleDefinitionFile,
  validateGeneratedModuleFiles
} from './module-generator'

describe('module generator deeper validation', () => {
  it('parses XML enum values when values.value is a single string', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const definitionPath = join(rootDir, 'single-enum.xml')

    await writeFile(definitionPath, `<moduleDefinition>
  <module>fiberTickets</module>
  <title>Awaria FTTH</title>
  <tableName>fiber_tickets</tableName>
  <route>network/fiber-tickets</route>
  <fields>
    <field name="status" label="Status" type="enum" default="OPEN">
      <values><value>OPEN</value></values>
    </field>
  </fields>
</moduleDefinition>`, 'utf8')

    const definition = await parseModuleDefinitionFile(definitionPath)

    expect(definition.fields[0]).toEqual(expect.objectContaining({
      name: 'status',
      values: ['OPEN']
    }))
  })

  it('rejects reserved fields in module definitions', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const definitionPath = join(rootDir, 'reserved.json')

    await writeFile(definitionPath, JSON.stringify({
      module: 'badTickets',
      title: 'Bad tickets',
      tableName: 'bad_tickets',
      route: 'bad/tickets',
      fields: [
        { name: 'id', type: 'uuid' }
      ]
    }), 'utf8')

    await expect(parseModuleDefinitionFile(definitionPath)).rejects.toThrow('Pole zarezerwowane')
  })

  it('detects missing migration and page in generated plans', async () => {
    const report = await validateGeneratedModuleFiles([
      { path: join(tmpdir(), 'server/db/generated/helpdesk-tickets.ts'), content: 'schema', kind: 'schema' },
      { path: join(tmpdir(), 'server/utils/generated/helpdesk-tickets.validation.ts'), content: 'validation', kind: 'validation' },
      { path: join(tmpdir(), 'server/api/helpdesk/tickets/index.get.ts'), content: 'api', kind: 'api' }
    ], { force: true })

    expect(report.success).toBe(false)
    expect(report.errors).toContain('Brak wymaganego typu pliku: migration')
    expect(report.errors).toContain('Brak wymaganego typu pliku: page')
  })

  it('does not reject absolute paths during generated file validation', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
    const files = [
      { path: join(rootDir, 'server/db/generated/helpdesk-tickets.ts'), content: 'schema', kind: 'schema' as const },
      { path: join(rootDir, 'server/utils/generated/helpdesk-tickets.validation.ts'), content: 'validation', kind: 'validation' as const },
      { path: join(rootDir, 'server/db/migrations/0000_helpdesk-tickets.sql'), content: 'migration', kind: 'migration' as const },
      { path: join(rootDir, 'server/api/helpdesk/tickets/index.get.ts'), content: 'api', kind: 'api' as const },
      { path: join(rootDir, 'app/pages/helpdesk/tickets.vue'), content: 'page', kind: 'page' as const }
    ]

    const report = await validateGeneratedModuleFiles(files, { force: true })

    expect(report.success).toBe(true)
  })

  it('parses --json in the CLI helper', () => {
    const options = parseArgs(['--input', 'a.json', '--dry-run', '--json'])

    expect(options).toEqual(expect.objectContaining({
      inputs: ['a.json'],
      dryRun: true,
      json: true
    }))
  })
})

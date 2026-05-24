import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

type FieldType = 'uuid' | 'text' | 'varchar' | 'integer' | 'number' | 'boolean' | 'timestamp' | 'date' | 'json' | 'enum'

interface ModuleField {
  name: string
  label?: string
  type: FieldType
  required?: boolean
  max?: number
  values?: string[]
  default?: string | number | boolean | null
  list?: boolean
  form?: boolean
}

interface ModuleDefinition {
  module: string
  title: string
  tableName: string
  route: string
  page?: string
  description?: string
  timestamps?: boolean
  fields: ModuleField[]
}

interface GeneratedFile {
  path: string
  content: string
}

interface GenerateOptions {
  rootDir: string
  definitionPath: string
  force?: boolean
  dryRun?: boolean
}

const FIELD_TYPES = new Set<FieldType>([
  'uuid',
  'text',
  'varchar',
  'integer',
  'number',
  'boolean',
  'timestamp',
  'date',
  'json',
  'enum'
])

const RESERVED_FIELD_NAMES = new Set(['id', 'createdAt', 'updatedAt'])

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} musi byc niepustym stringiem`)
  }
  return value.trim()
}

function assertIdentifier(value: string, label: string): string {
  const normalized = value.trim()
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(normalized)) {
    throw new Error(`${label} musi byc camelCase bez znakow specjalnych: ${value}`)
  }
  return normalized
}

function assertPath(value: string, label: string): string {
  const normalized = value.trim().replace(/^\/+|\/+$/g, '')
  if (!normalized || normalized.includes('..') || !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(normalized)) {
    throw new Error(`${label} musi byc bezpieczna sciezka kebab-case, np. network/widgets`)
  }
  return normalized
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}

function toKebabCase(value: string): string {
  return toSnakeCase(value).replace(/_/g, '-')
}

function toPascalCase(value: string): string {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) => char ? char.toUpperCase() : '')
    .replace(/^[a-z]/, char => char.toUpperCase())
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, '\'\'')}'`
}

function tsString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`
}

function validateDefinition(input: unknown): ModuleDefinition {
  if (!input || typeof input !== 'object') {
    throw new Error('Definicja musi byc obiektem JSON')
  }
  const raw = input as Record<string, unknown>
  const moduleName = assertIdentifier(assertString(raw.module, 'module'), 'module')
  const tableName = assertString(raw.tableName, 'tableName')
  if (!/^[a-z][a-z0-9_]*$/.test(tableName)) {
    throw new Error('tableName musi byc snake_case')
  }

  const fieldsRaw = raw.fields
  if (!Array.isArray(fieldsRaw) || fieldsRaw.length === 0) {
    throw new Error('fields musi zawierac przynajmniej jedno pole')
  }

  const usedNames = new Set<string>()
  const fields = fieldsRaw.map((entry, index): ModuleField => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`fields[${index}] musi byc obiektem`)
    }
    const fieldRaw = entry as Record<string, unknown>
    const name = assertIdentifier(assertString(fieldRaw.name, `fields[${index}].name`), `fields[${index}].name`)
    if (RESERVED_FIELD_NAMES.has(name)) {
      throw new Error(`Pole ${name} jest generowane automatycznie`)
    }
    if (usedNames.has(name)) {
      throw new Error(`Powtorzona nazwa pola: ${name}`)
    }
    usedNames.add(name)

    const type = assertString(fieldRaw.type, `fields[${index}].type`) as FieldType
    if (!FIELD_TYPES.has(type)) {
      throw new Error(`Nieznany typ pola ${name}: ${type}`)
    }

    const values = Array.isArray(fieldRaw.values) ? fieldRaw.values.map(value => assertString(value, `${name}.values`)) : undefined
    if (type === 'enum' && (!values || values.length === 0)) {
      throw new Error(`Pole enum ${name} wymaga values`)
    }

    return {
      name,
      label: typeof fieldRaw.label === 'string' && fieldRaw.label.trim() ? fieldRaw.label.trim() : name,
      type,
      required: Boolean(fieldRaw.required),
      max: typeof fieldRaw.max === 'number' ? fieldRaw.max : undefined,
      values,
      default: fieldRaw.default as ModuleField['default'],
      list: fieldRaw.list !== false,
      form: fieldRaw.form !== false
    }
  })

  return {
    module: moduleName,
    title: assertString(raw.title, 'title'),
    tableName,
    route: assertPath(assertString(raw.route, 'route'), 'route'),
    page: raw.page === undefined ? undefined : assertPath(assertString(raw.page, 'page'), 'page'),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    timestamps: raw.timestamps !== false,
    fields
  }
}

function drizzleColumn(field: ModuleField): string {
  const columnName = toSnakeCase(field.name)
  let expression: string
  switch (field.type) {
    case 'uuid':
      expression = `uuid('${columnName}')`
      break
    case 'text':
      expression = `text('${columnName}')`
      break
    case 'varchar':
    case 'enum':
      expression = `varchar('${columnName}', { length: ${field.max || 255} })`
      break
    case 'integer':
      expression = `integer('${columnName}')`
      break
    case 'number':
      expression = `doublePrecision('${columnName}')`
      break
    case 'boolean':
      expression = `boolean('${columnName}')`
      break
    case 'timestamp':
    case 'date':
      expression = `timestamp('${columnName}')`
      break
    case 'json':
      expression = `jsonb('${columnName}')`
      break
  }

  if (field.default !== undefined) {
    if (typeof field.default === 'string') expression += `.default(${tsString(field.default)})`
    else if (field.default === null) expression += '.default(null)'
    else expression += `.default(${String(field.default)})`
  }
  if (field.required) expression += '.notNull()'
  return `  ${field.name}: ${expression}`
}

function sqlColumn(field: ModuleField): string {
  const columnName = toSnakeCase(field.name)
  let type: string
  switch (field.type) {
    case 'uuid':
      type = 'uuid'
      break
    case 'text':
      type = 'text'
      break
    case 'varchar':
    case 'enum':
      type = `varchar(${field.max || 255})`
      break
    case 'integer':
      type = 'integer'
      break
    case 'number':
      type = 'double precision'
      break
    case 'boolean':
      type = 'boolean'
      break
    case 'timestamp':
    case 'date':
      type = 'timestamp'
      break
    case 'json':
      type = 'jsonb'
      break
  }

  const chunks = [`  "${columnName}" ${type}`]
  if (field.default !== undefined) {
    if (typeof field.default === 'string') chunks.push(`DEFAULT ${sqlString(field.default)}`)
    else if (field.default === null) chunks.push('DEFAULT null')
    else chunks.push(`DEFAULT ${String(field.default)}`)
  }
  if (field.required) chunks.push('NOT NULL')
  return chunks.join(' ')
}

function zodField(field: ModuleField, partial: boolean): string {
  let expression: string
  switch (field.type) {
    case 'uuid':
      expression = 'z.string().uuid()'
      break
    case 'text':
      expression = 'z.string()'
      break
    case 'varchar':
      expression = `z.string().max(${field.max || 255})`
      break
    case 'enum':
      expression = `z.enum([${(field.values || []).map(tsString).join(', ')}])`
      break
    case 'integer':
      expression = 'z.coerce.number().int()'
      break
    case 'number':
      expression = 'z.coerce.number()'
      break
    case 'boolean':
      expression = 'z.boolean()'
      break
    case 'timestamp':
    case 'date':
      expression = 'z.coerce.date()'
      break
    case 'json':
      expression = 'z.record(z.string(), z.unknown())'
      break
  }

  if (!field.required || partial) expression += '.optional().nullable()'
  return `  ${field.name}: ${expression}`
}

function formDefault(field: ModuleField): string {
  if (field.default !== undefined) {
    if (typeof field.default === 'string') return tsString(field.default)
    return String(field.default)
  }
  if (field.type === 'boolean') return 'false'
  if (field.type === 'integer' || field.type === 'number') return 'undefined'
  return 'undefined'
}

function componentForField(field: ModuleField): string {
  if (field.type === 'boolean') {
    return `<UCheckbox v-model="state.${field.name}" />`
  }
  if (field.type === 'enum') {
    return `<USelect v-model="state.${field.name}" :items="${field.name}Items" class="w-full" />`
  }
  if (field.type === 'text' || field.type === 'json') {
    return `<UTextarea v-model="state.${field.name}" class="w-full" />`
  }
  if (field.type === 'integer' || field.type === 'number') {
    return `<UInput v-model.number="state.${field.name}" type="number" class="w-full" />`
  }
  if (field.type === 'timestamp' || field.type === 'date') {
    return `<UInput v-model="state.${field.name}" type="datetime-local" class="w-full" />`
  }
  return `<UInput v-model="state.${field.name}" class="w-full" />`
}

function requiredImports(definition: ModuleDefinition): string {
  const imports = new Set(['pgTable', 'uuid', 'timestamp'])
  for (const field of definition.fields) {
    switch (field.type) {
      case 'uuid':
        imports.add('uuid')
        break
      case 'text':
        imports.add('text')
        break
      case 'varchar':
      case 'enum':
        imports.add('varchar')
        break
      case 'integer':
        imports.add('integer')
        break
      case 'number':
        imports.add('doublePrecision')
        break
      case 'boolean':
        imports.add('boolean')
        break
      case 'timestamp':
      case 'date':
        imports.add('timestamp')
        break
      case 'json':
        imports.add('jsonb')
        break
    }
  }
  return Array.from(imports).sort().join(', ')
}

function renderSchema(definition: ModuleDefinition): string {
  const columns = [
    '  id: uuid(\'id\').defaultRandom().primaryKey()',
    ...definition.fields.map(drizzleColumn)
  ]
  if (definition.timestamps) {
    columns.push('  createdAt: timestamp(\'created_at\').defaultNow().notNull()')
    columns.push('  updatedAt: timestamp(\'updated_at\').defaultNow().notNull()')
  }
  return `import { ${requiredImports(definition)} } from 'drizzle-orm/pg-core'

export const ${definition.module} = pgTable('${definition.tableName}', {
${columns.join(',\n')}
})

export type ${toPascalCase(definition.module)} = typeof ${definition.module}.$inferSelect
export type New${toPascalCase(definition.module)} = typeof ${definition.module}.$inferInsert
`
}

function renderValidation(definition: ModuleDefinition): string {
  return `import { z } from 'zod'

export const create${toPascalCase(definition.module)}Schema = z.object({
${definition.fields.map(field => zodField(field, false)).join(',\n')}
})

export const update${toPascalCase(definition.module)}Schema = z.object({
${definition.fields.map(field => zodField(field, true)).join(',\n')}
})
`
}

function renderMigration(definition: ModuleDefinition): string {
  const columns = [
    '  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL',
    ...definition.fields.map(sqlColumn)
  ]
  if (definition.timestamps) {
    columns.push('  "created_at" timestamp DEFAULT now() NOT NULL')
    columns.push('  "updated_at" timestamp DEFAULT now() NOT NULL')
  }
  return `CREATE TABLE "${definition.tableName}" (
${columns.join(',\n')}
);
`
}

function apiImportPrefix(route: string): string {
  const depth = route.split('/').length
  return '../'.repeat(depth + 1)
}

function renderIndexGet(definition: ModuleDefinition): string {
  const prefix = apiImportPrefix(definition.route)
  return `import { desc } from 'drizzle-orm'
import { ${definition.module} } from '${prefix}db/generated/${toKebabCase(definition.module)}'
import { db } from '${prefix}utils/db'

export default defineEventHandler(async () => {
  const rows = await db.select().from(${definition.module}).orderBy(desc(${definition.module}.createdAt))
  return { success: true, data: rows }
})
`
}

function renderIndexPost(definition: ModuleDefinition): string {
  const prefix = apiImportPrefix(definition.route)
  return `import { readBody } from 'h3'
import { ${definition.module} } from '${prefix}db/generated/${toKebabCase(definition.module)}'
import { create${toPascalCase(definition.module)}Schema } from '${prefix}utils/generated/${toKebabCase(definition.module)}.validation'
import { db } from '${prefix}utils/db'

export default defineEventHandler(async (event) => {
  const payload = create${toPascalCase(definition.module)}Schema.parse(await readBody(event))
  const [row] = await db.insert(${definition.module}).values(payload).returning()
  return { success: true, data: row }
})
`
}

function renderPatch(definition: ModuleDefinition): string {
  const prefix = apiImportPrefix(definition.route)
  return `import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { ${definition.module} } from '${prefix}db/generated/${toKebabCase(definition.module)}'
import { update${toPascalCase(definition.module)}Schema } from '${prefix}utils/generated/${toKebabCase(definition.module)}.validation'
import { db } from '${prefix}utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id' })

  const payload = definedEntries(update${toPascalCase(definition.module)}Schema.parse(await readBody(event)))
  const [row] = await db.update(${definition.module}).set(payload).where(eq(${definition.module}.id, id)).returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Rekord nie istnieje' })
  return { success: true, data: row }
})
`
}

function renderDelete(definition: ModuleDefinition): string {
  const prefix = apiImportPrefix(definition.route)
  return `import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { ${definition.module} } from '${prefix}db/generated/${toKebabCase(definition.module)}'
import { db } from '${prefix}utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id' })

  const [row] = await db.delete(${definition.module}).where(eq(${definition.module}.id, id)).returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Rekord nie istnieje' })
  return { success: true, data: row }
})
`
}

function renderPage(definition: ModuleDefinition): string {
  const route = `/api/${definition.route}`
  const rowType = `${toPascalCase(definition.module)}Row`
  const schemaLines = definition.fields
    .filter(field => field.form !== false)
    .map((field) => {
      const optional = field.required ? '' : '?'
      const type = field.type === 'boolean'
        ? 'boolean'
        : field.type === 'integer' || field.type === 'number'
          ? 'number'
          : field.type === 'json'
            ? 'Record<string, unknown>'
            : 'string'
      return `  ${field.name}${optional}: ${type} | null`
    })
  const columnLines = definition.fields
    .filter(field => field.list !== false)
    .map(field => `  { accessorKey: '${field.name}', header: ${tsString(field.label || field.name)} }`)
  const defaults = definition.fields
    .filter(field => field.form !== false)
    .map(field => `  ${field.name}: ${formDefault(field)}`)
  const enumItems = definition.fields
    .filter(field => field.type === 'enum')
    .map(field => `const ${field.name}Items = ${JSON.stringify(field.values || [])}`)
  const formFields = definition.fields
    .filter(field => field.form !== false)
    .map(field => `                <UFormField label="${field.label || field.name}" name="${field.name}"${field.required ? ' required' : ''}>
                  ${componentForField(field)}
                </UFormField>`)

  return `<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface ${rowType} {
  id: string
${schemaLines.join('\n')}
}

const toast = useToast()
const open = ref(false)
const editingId = ref<string | null>(null)
const selectedRow = ref<${rowType} | null>(null)

${enumItems.join('\n')}

const state = reactive<Partial<${rowType}>>({
${defaults.join(',\n')}
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: ${rowType}[] }>('${route}', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => data.value.data)

const columns: TableColumn<${rowType}>[] = [
${columnLines.join(',\n')}
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, {
${defaults.join(',\n')}
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: ${rowType}) {
  selectedRow.value = row
  editingId.value = row.id
  Object.assign(state, row)
  open.value = true
}

async function onSubmit() {
  await $fetch(editingId.value ? \`${route}/\${editingId.value}\` : '${route}', {
    method: editingId.value ? 'PATCH' : 'POST',
    body: state
  })
  toast.add({ title: 'Zapisano rekord', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deleteRow(row: ${rowType}) {
  if (!window.confirm('Usunac rekord?')) return
  await $fetch(\`${route}/\${row.id}\`, { method: 'DELETE' })
  toast.add({ title: 'Usunieto rekord', color: 'success' })
  await refresh()
}

function rowContextItems(row: ${rowType}): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Usun', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteRow(row) },
    { label: 'Odswiez', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="${toKebabCase(definition.module)}" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="${definition.title}">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="open" :title="editingId ? 'Edytuj' : 'Dodaj'">
            <UButton label="Dodaj" icon="i-lucide-plus" @click="openCreate" />
            <template #body>
              <form class="space-y-4" @submit.prevent="onSubmit">
${formFields.join('\n')}
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </form>
            </template>
          </USlideover>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <AppDataTable
        :data="rows"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
    </template>
  </UDashboardPanel>
</template>
`
}

async function nextMigrationName(rootDir: string, moduleName: string): Promise<string> {
  const migrationsDir = join(rootDir, 'server/db/migrations')
  let next = 1
  try {
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(migrationsDir)
    const max = files
      .map(file => /^(\d+)_/.exec(file)?.[1])
      .filter((value): value is string => Boolean(value))
      .map(value => Number(value))
      .reduce((largest, value) => Math.max(largest, value), 0)
    next = max + 1
  } catch {
    next = 1
  }
  return `${String(next).padStart(4, '0')}_${toKebabCase(moduleName)}.sql`
}

export async function generateModuleFiles(options: GenerateOptions): Promise<GeneratedFile[]> {
  const definitionJson = JSON.parse(await readFile(options.definitionPath, 'utf8')) as unknown
  const definition = validateDefinition(definitionJson)
  const moduleFileName = toKebabCase(definition.module)
  const pagePath = definition.page || definition.route
  const migrationName = await nextMigrationName(options.rootDir, definition.module)
  const apiBase = join(options.rootDir, 'server/api', definition.route)

  return [
    {
      path: join(options.rootDir, 'server/db/generated', `${moduleFileName}.ts`),
      content: renderSchema(definition)
    },
    {
      path: join(options.rootDir, 'server/utils/generated', `${moduleFileName}.validation.ts`),
      content: renderValidation(definition)
    },
    {
      path: join(options.rootDir, 'server/db/migrations', migrationName),
      content: renderMigration(definition)
    },
    {
      path: join(apiBase, 'index.get.ts'),
      content: renderIndexGet(definition)
    },
    {
      path: join(apiBase, 'index.post.ts'),
      content: renderIndexPost(definition)
    },
    {
      path: join(apiBase, '[id].patch.ts'),
      content: renderPatch(definition)
    },
    {
      path: join(apiBase, '[id].delete.ts'),
      content: renderDelete(definition)
    },
    {
      path: join(options.rootDir, 'app/pages', `${pagePath}.vue`),
      content: renderPage(definition)
    }
  ]
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function writeGeneratedFiles(files: GeneratedFile[], options: Pick<GenerateOptions, 'force' | 'dryRun'> = {}) {
  for (const file of files) {
    if (options.dryRun) continue
    if (!options.force && await pathExists(file.path)) {
      throw new Error(`Plik juz istnieje: ${file.path}. Uzyj --force, jesli chcesz nadpisac.`)
    }
    await mkdir(dirname(file.path), { recursive: true })
    await writeFile(file.path, file.content, 'utf8')
  }
}

export function formatGeneratedFileList(files: GeneratedFile[]): string {
  return files.map(file => `${basename(file.path)} -> ${file.path}`).join('\n')
}

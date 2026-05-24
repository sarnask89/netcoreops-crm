import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, join, normalize, resolve } from 'node:path'
import { XMLParser } from 'fast-xml-parser'
import { z } from 'zod'

export type FieldType
  = | 'uuid'
    | 'text'
    | 'varchar'
    | 'integer'
    | 'number'
    | 'boolean'
    | 'timestamp'
    | 'date'
    | 'json'
    | 'enum'

export interface ModuleField {
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

export interface ModuleDefinition {
  module: string
  title: string
  tableName: string
  route: string
  page?: string
  description?: string
  timestamps?: boolean
  fields: ModuleField[]
}

export interface GeneratedFile {
  path: string
  content: string
  kind?: 'schema' | 'validation' | 'migration' | 'api' | 'page' | 'test' | 'other'
}

export interface ValidationReport {
  success: boolean
  phase: string
  errors: string[]
  warnings: string[]
}

export interface ModuleGenerationPlan {
  modules: ModuleDefinition[]
  files: GeneratedFile[]
  validation: ValidationReport
}

const fieldTypeValues = [
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
] as const

const requiredGeneratedKinds = [
  'schema',
  'validation',
  'migration',
  'api',
  'page'
] as const

const reservedFieldNames = new Set(['id', 'createdAt', 'updatedAt'])
const FieldTypeSchema = z.enum(fieldTypeValues)
const unsafePathMessage = 'Niedozwolona wartosc: path traversal albo niedozwolony separator'

function hasPathTraversal(value: string): boolean {
  return (
    value.includes('\0')
    || value.split(/[\\/]+/).includes('..')
    || value.includes('\\')
    || isAbsolute(value)
  )
}

function hasGeneratedPathTraversal(value: string): boolean {
  return value.includes('\0') || value.split(/[\\/]+/).includes('..')
}

function isSafeIdentifier(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]*$/.test(value) && !hasPathTraversal(value)
}

function isCamelCase(value: string): boolean {
  return /^[a-z][A-Za-z0-9]*$/.test(value) && !hasPathTraversal(value)
}

function isSnakeCase(value: string): boolean {
  return /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value) && !hasPathTraversal(value)
}

function isSafeRoute(value: string): boolean {
  if (hasPathTraversal(value)) {
    return false
  }

  return value
    .split('/')
    .every(segment => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))
}

const ModuleFieldSchema = z.object({
  name: z.string().trim().min(1).refine(isSafeIdentifier, unsafePathMessage),
  label: z.string().trim().min(1).optional(),
  type: FieldTypeSchema,
  required: z.boolean().optional(),
  max: z.number().int().positive().optional(),
  values: z.array(z.string().trim().min(1)).optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  list: z.boolean().optional(),
  form: z.boolean().optional()
}).superRefine((field, ctx) => {
  if (reservedFieldNames.has(field.name)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['name'],
      message: `Pole zarezerwowane: ${field.name}`
    })
  }

  if (field.type === 'enum' && (!field.values || field.values.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['values'],
      message: 'Pole enum wymaga values'
    })
  }
})

const ModuleDefinitionSchema = z.object({
  module: z.string().trim().min(1).refine(isCamelCase, 'module musi byc camelCase'),
  title: z.string().trim().min(1),
  tableName: z.string().trim().min(1).refine(isSnakeCase, 'tableName musi byc snake_case'),
  route: z.string().trim().min(1).refine(isSafeRoute, 'route musi skladac sie z kebab-case segmentow'),
  page: z.string().trim().min(1).refine(isSafeRoute, 'page musi skladac sie z kebab-case segmentow').optional(),
  description: z.string().trim().optional(),
  timestamps: z.boolean().optional(),
  fields: z.array(ModuleFieldSchema).min(1)
}).superRefine((definition, ctx) => {
  const fieldNames = new Set<string>()

  for (const [index, field] of definition.fields.entries()) {
    if (fieldNames.has(field.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fields', index, 'name'],
        message: `Duplikat pola: ${field.name}`
      })
    }

    fieldNames.add(field.name)
  }
})

export function validateDefinition(input: unknown): ModuleDefinition {
  const result = ModuleDefinitionSchema.safeParse(input)

  if (!result.success) {
    const message = result.error.issues
      .map(issue => `${issue.path.join('.') || 'definition'}: ${issue.message}`)
      .join('; ')

    throw new Error(`Nieprawidlowa definicja modulu: ${message}`)
  }

  return result.data
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function xmlBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true
    }

    if (value.toLowerCase() === 'false') {
      return false
    }
  }

  return undefined
}

function xmlNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function xmlDefault(value: unknown, type: FieldType): string | number | boolean | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return value as string | number | boolean | null
  }

  if (value.toLowerCase() === 'null') {
    return null
  }

  if (type === 'boolean') {
    return value.toLowerCase() === 'true'
  }

  if (type === 'integer' || type === 'number') {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : value
  }

  return value
}

function mapXmlField(field: Record<string, unknown>): ModuleField {
  const type = String(field.type || 'text') as FieldType
  const valuesNode = field.values && typeof field.values === 'object'
    ? (field.values as Record<string, unknown>).value
    : undefined

  const values = asArray(valuesNode)
    .map(value => String(value).trim())
    .filter(Boolean)

  const mapped: ModuleField = {
    name: String(field.name || ''),
    label: field.label === undefined ? undefined : String(field.label),
    type,
    required: xmlBoolean(field.required),
    max: xmlNumber(field.max),
    values: values.length > 0 ? values : undefined,
    default: xmlDefault(field.default, type),
    list: xmlBoolean(field.list),
    form: xmlBoolean(field.form)
  }

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined)
  ) as ModuleField
}

function mapXmlDefinition(input: Record<string, unknown>): ModuleDefinition {
  const root = (input.moduleDefinition || input.ModuleDefinition || input) as Record<string, unknown>
  const fieldsRoot = root.fields as Record<string, unknown> | undefined
  const fields = fieldsRoot ? asArray(fieldsRoot.field as Record<string, unknown> | Record<string, unknown>[]) : []

  return {
    module: String(root.module || ''),
    title: String(root.title || ''),
    tableName: String(root.tableName || ''),
    route: String(root.route || ''),
    page: root.page === undefined ? undefined : String(root.page),
    description: root.description === undefined ? undefined : String(root.description),
    timestamps: xmlBoolean(root.timestamps),
    fields: fields.map(mapXmlField)
  }
}

export async function parseModuleDefinitionFile(definitionPath: string): Promise<ModuleDefinition> {
  const extension = extname(definitionPath).toLowerCase()
  const raw = await readFile(definitionPath, 'utf8')

  if (extension === '.json') {
    return validateDefinition(JSON.parse(raw))
  }

  if (extension === '.xml') {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      trimValues: true,
      parseAttributeValue: false,
      parseTagValue: false
    })

    const parsed = parser.parse(raw) as Record<string, unknown>

    return validateDefinition(mapXmlDefinition(parsed))
  }

  throw new Error(`Nieobslugiwany format definicji: ${extension || definitionPath}`)
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

function renderMigrationFile(definition: ModuleDefinition): string {
  const columns = [
    '  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL',
    ...definition.fields.map((field) => {
      const columnName = toSnakeCase(field.name)
      const type = field.type === 'varchar' || field.type === 'enum'
        ? `varchar(${field.max || 255})`
        : field.type === 'integer'
          ? 'integer'
          : field.type === 'number'
            ? 'double precision'
            : field.type === 'boolean'
              ? 'boolean'
              : field.type === 'json'
                ? 'jsonb'
                : field.type === 'timestamp' || field.type === 'date'
                  ? 'timestamp'
                  : 'text'

      return `  "${columnName}" ${type}${field.required ? ' NOT NULL' : ''}`
    })
  ]

  if (definition.timestamps !== false) {
    columns.push('  "created_at" timestamp DEFAULT now() NOT NULL')
    columns.push('  "updated_at" timestamp DEFAULT now() NOT NULL')
  }

  return `CREATE TABLE "${definition.tableName}" (\n${columns.join(',\n')}\n);\n`
}

function buildGeneratedModuleFiles(rootDir: string, definition: ModuleDefinition): GeneratedFile[] {
  const pagePath = definition.page || definition.route
  const safeModule = toKebabCase(definition.module)
  const safeRoute = definition.route

  const files: GeneratedFile[] = [
    {
      path: join(rootDir, 'server/db/generated', `${safeModule}.ts`),
      kind: 'schema',
      content: renderSchemaFile(definition)
    },
    {
      path: join(rootDir, 'server/utils/generated', `${safeModule}.validation.ts`),
      kind: 'validation',
      content: renderValidationFile(definition)
    },
    {
      path: join(rootDir, 'server/db/migrations', `0000_${safeModule}.sql`),
      kind: 'migration',
      content: renderMigrationFile(definition)
    },
    {
      path: join(rootDir, 'server/api', safeRoute, 'index.get.ts'),
      kind: 'api',
      content: renderApiListFile(definition)
    },
    {
      path: join(rootDir, 'server/api', safeRoute, 'index.post.ts'),
      kind: 'api',
      content: renderApiCreateFile(definition)
    },
    {
      path: join(rootDir, 'server/api', safeRoute, '[id].patch.ts'),
      kind: 'api',
      content: renderApiUpdateFile(definition)
    },
    {
      path: join(rootDir, 'server/api', safeRoute, '[id].delete.ts'),
      kind: 'api',
      content: renderApiDeleteFile(definition)
    },
    {
      path: join(rootDir, 'app/pages', `${pagePath}.vue`),
      kind: 'page',
      content: renderCrudPageVue(definition)
    }
  ]

  return files.map(file => ({
    ...file,
    path: normalize(file.path)
  }))
}

export async function generateModuleFiles(options: {
  rootDir: string
  definitionPath: string
}): Promise<GeneratedFile[]> {
  const definition = await parseModuleDefinitionFile(options.definitionPath)

  return buildGeneratedModuleFiles(options.rootDir, definition)
}

export async function generateModulePlan(options: {
  rootDir: string
  definitionPaths: string[]
  force?: boolean
}): Promise<ModuleGenerationPlan> {
  const modules: ModuleDefinition[] = []
  const files: GeneratedFile[] = []

  for (const definitionPath of options.definitionPaths) {
    const definition = await parseModuleDefinitionFile(definitionPath)
    modules.push(definition)
    files.push(...buildGeneratedModuleFiles(options.rootDir, definition))
  }

  const validation = await validateGeneratedModuleFiles(files, {
    force: options.force
  })

  return {
    modules,
    files,
    validation
  }
}

function inferGeneratedKind(file: GeneratedFile): GeneratedFile['kind'] | undefined {
  if (file.kind) {
    return file.kind
  }

  if (file.path.endsWith('.validation.ts')) {
    return 'validation'
  }

  if (file.path.endsWith('.sql')) {
    return 'migration'
  }

  if (file.path.endsWith('.vue')) {
    return 'page'
  }

  if (file.path.includes(`${normalize('server/api')}`) && file.path.endsWith('.ts')) {
    return 'api'
  }

  if (file.path.includes(`${normalize('server/db/generated')}`) && file.path.endsWith('.ts')) {
    return 'schema'
  }

  return undefined
}

function inferModuleKey(file: GeneratedFile): string | undefined {
  const kind = inferGeneratedKind(file)
  const name = basename(file.path)

  if (kind === 'schema' && name.endsWith('.ts')) {
    return name.slice(0, -'.ts'.length)
  }

  if (kind === 'validation' && name.endsWith('.validation.ts')) {
    return name.slice(0, -'.validation.ts'.length)
  }

  if (kind === 'migration' && name.endsWith('.sql')) {
    return name
      .slice(0, -'.sql'.length)
      .replace(/^\d+_/, '')
  }

  return undefined
}

export async function validateGeneratedModuleFiles(
  files: GeneratedFile[],
  options: { force?: boolean } = {}
): Promise<ValidationReport> {
  const errors: string[] = []
  const warnings: string[] = []
  const seen = new Set<string>()
  const kindCounts = new Map<string, number>()
  const moduleKinds = new Map<string, Set<string>>()

  for (const file of files) {
    if (!file.path || typeof file.path !== 'string') {
      errors.push('Brak sciezki pliku w planie')
      continue
    }

    if (hasGeneratedPathTraversal(file.path)) {
      errors.push(`Niedozwolona sciezka pliku: ${file.path}`)
      continue
    }

    const targetPath = isAbsolute(file.path) ? normalize(file.path) : resolve(process.cwd(), file.path)
    const normalizedPath = normalize(file.path)

    if (seen.has(normalizedPath)) {
      errors.push(`Duplikat sciezki w planie: ${normalizedPath}`)
    }

    seen.add(normalizedPath)

    if (typeof file.content !== 'string' || file.content.trim().length === 0) {
      errors.push(`Pusty content pliku: ${normalizedPath}`)
    }

    if (options.force !== true) {
      try {
        await access(targetPath)
        errors.push(`Plik juz istnieje: ${normalizedPath}`)
      } catch {
        // Plik nie istnieje, czyli dobrze.
      }
    }

    const kind = inferGeneratedKind(file)

    if (kind) {
      kindCounts.set(kind, (kindCounts.get(kind) || 0) + 1)
    }

    const moduleKey = inferModuleKey(file)

    if (moduleKey && kind) {
      const set = moduleKinds.get(moduleKey) || new Set<string>()
      set.add(kind)
      moduleKinds.set(moduleKey, set)
    }
  }

  for (const kind of requiredGeneratedKinds) {
    if (!kindCounts.has(kind)) {
      errors.push(`Brak wymaganego typu pliku: ${kind}`)
    }
  }

  for (const [moduleKey, kinds] of moduleKinds.entries()) {
    for (const kind of ['schema', 'validation', 'migration']) {
      if (!kinds.has(kind)) {
        errors.push(`Brak ${kind} dla modulu: ${moduleKey}`)
      }
    }
  }

  return {
    success: errors.length === 0,
    phase: 'validateGeneratedModuleFiles',
    errors,
    warnings
  }
}

export async function writeGeneratedFiles(
  files: GeneratedFile[],
  options: { force?: boolean } = {}
): Promise<void> {
  const validation = await validateGeneratedModuleFiles(files, options)

  if (!validation.success) {
    throw new Error(validation.errors.join('\n'))
  }

  for (const file of files) {
    if (hasGeneratedPathTraversal(file.path)) {
      throw new Error(`Niedozwolona sciezka pliku: ${file.path}`)
    }

    const target = isAbsolute(file.path) ? normalize(file.path) : resolve(process.cwd(), file.path)

    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, file.content, 'utf8')
  }
}

function renderSchemaFile(definition: ModuleDefinition): string {
  return `import { boolean, integer, json, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'\n\nexport const ${definition.module} = pgTable('${definition.tableName}', {\n${definition.fields.map(renderSchemaField).join(',\n')}\n${definition.timestamps === false
    ? ''
    : `,\n  createdAt: timestamp('created_at').notNull().defaultNow(),\n  updatedAt: timestamp('updated_at').notNull().defaultNow()`}\n})\n`
}

function renderSchemaField(field: ModuleField): string {
  const columnName = field.name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  const notNull = field.required ? '.notNull()' : ''

  switch (field.type) {
    case 'uuid':
      return `  ${field.name}: uuid('${columnName}').primaryKey().defaultRandom()`
    case 'integer':
      return `  ${field.name}: integer('${columnName}')${notNull}`
    case 'number':
      return `  ${field.name}: integer('${columnName}')${notNull}`
    case 'boolean':
      return `  ${field.name}: boolean('${columnName}')${notNull}`
    case 'timestamp':
      return `  ${field.name}: timestamp('${columnName}')${notNull}`
    case 'json':
      return `  ${field.name}: json('${columnName}')${notNull}`
    case 'varchar':
    case 'enum':
      return `  ${field.name}: varchar('${columnName}', { length: ${field.max || 255} })${notNull}`
    case 'date':
    case 'text':
    default:
      return `  ${field.name}: text('${columnName}')${notNull}`
  }
}

function renderValidationFile(definition: ModuleDefinition): string {
  return `import { z } from 'zod'\n\nexport const ${definition.module}InputSchema = z.object({\n${definition.fields.map(renderValidationField).join(',\n')}\n})\n\nexport type ${capitalize(definition.module)}Input = z.infer<typeof ${definition.module}InputSchema>\n`
}

function renderValidationField(field: ModuleField): string {
  let schema = 'z.string()'

  if (field.type === 'integer') {
    schema = 'z.number().int()'
  } else if (field.type === 'number') {
    schema = 'z.number()'
  } else if (field.type === 'boolean') {
    schema = 'z.boolean()'
  } else if (field.type === 'json') {
    schema = 'z.unknown()'
  } else if (field.type === 'enum') {
    schema = `z.enum(${JSON.stringify(field.values || [])} as [string, ...string[]])`
  }

  if (field.max && ['text', 'varchar'].includes(field.type)) {
    schema += `.max(${field.max})`
  }

  if (!field.required) {
    schema += '.optional()'
  }

  return `  ${field.name}: ${schema}`
}

function validationImportPath(definition: ModuleDefinition): string {
  const depth = definition.route.split('/').filter(Boolean).length + 1

  return `${'../'.repeat(depth)}utils/generated/${toKebabCase(definition.module)}.validation`
}

function renderApiListFile(definition: ModuleDefinition): string {
  return `export default defineEventHandler(async () => {\n  return {\n    data: [],\n    module: '${definition.module}'\n  }\n})\n`
}

function renderApiCreateFile(definition: ModuleDefinition): string {
  return `import { ${definition.module}InputSchema } from '${validationImportPath(definition)}'\n\nexport default defineEventHandler(async (event) => {\n  const body = await readBody(event)\n  const input = ${definition.module}InputSchema.parse(body)\n\n  return {\n    success: true,\n    data: input\n  }\n})\n`
}

function renderApiUpdateFile(definition: ModuleDefinition): string {
  return `import { ${definition.module}InputSchema } from '${validationImportPath(definition)}'\n\nexport default defineEventHandler(async (event) => {\n  const id = getRouterParam(event, 'id')\n  const body = await readBody(event)\n  const input = ${definition.module}InputSchema.partial().parse(body)\n\n  return {\n    success: true,\n    data: {\n      id,\n      ...input\n    }\n  }\n})\n`
}

function renderApiDeleteFile(_definition: ModuleDefinition): string {
  return `export default defineEventHandler(async (event) => {\n  const id = getRouterParam(event, 'id')\n\n  return {\n    success: true,\n    data: {\n      id\n    }\n  }\n})\n`
}

function renderCrudPageVue(definition: ModuleDefinition): string {
  const visibleFields = definition.fields.filter(field => field.list !== false)
  const formFields = definition.fields.filter(field => field.form !== false && field.type !== 'uuid')

  return `<script setup lang="ts">\ntype Row = Record<string, unknown>\n\nconst toast = useToast()\nconst rows = ref<Row[]>([])\nconst state = reactive<Record<string, unknown>>({\n${formFields.map(field => `  ${field.name}: ${JSON.stringify(field.default ?? defaultValueForField(field))}`).join(',\n')}\n})\n\nconst columns = [\n${visibleFields.map(field => `  { accessorKey: '${field.name}', header: '${field.label || field.name}' }`).join(',\n')}\n]\n\nconst selectedRow = ref<Row | null>(null)\nconst slideoverOpen = ref(false)\n\nfunction rowContextItems(row: Row) {\n  return [[\n    {\n      label: 'Edytuj',\n      icon: 'i-lucide-pencil',\n      onSelect: () => {\n        selectedRow.value = row\n\n        for (const key of Object.keys(state)) {\n          state[key] = row[key] ?? state[key]\n        }\n\n        slideoverOpen.value = true\n      }\n    },\n    {\n      label: 'Usun',\n      icon: 'i-lucide-trash',\n      color: 'error',\n      onSelect: async () => {\n        if (!row.id) return\n\n        await $fetch('/api/${definition.route}/' + row.id, {\n          method: 'DELETE'\n        })\n\n        toast.add({\n          title: 'Rekord usuniety',\n          color: 'success'\n        })\n      }\n    }\n  ]]\n}\n\nasync function onSubmit() {\n  await $fetch('/api/${definition.route}', {\n    method: 'POST',\n    body: state\n  })\n\n  toast.add({\n    title: 'Zapisano',\n    color: 'success'\n  })\n\n  slideoverOpen.value = false\n}\n</script>\n\n<template>\n  <UDashboardPanel>\n    <template #header>\n      <UDashboardNavbar title="${definition.title}">\n        <template #leading>\n          <UDashboardSidebarCollapse />\n        </template>\n\n        <template #right>\n          <UButton icon="i-lucide-plus" label="Dodaj" @click="slideoverOpen = true" />\n        </template>\n      </UDashboardNavbar>\n    </template>\n\n    <template #body>\n      <AppDataTable\n        :data="rows"\n        :columns="columns"\n        :context-items="rowContextItems"\n      />\n\n      <USlideover v-model:open="slideoverOpen" title="${definition.title}">\n        <template #body>\n          <UForm :state="state" class="space-y-4" @submit="onSubmit">\n${formFields.map(renderVueFormField).join('\n\n')}\n\n            <div class="flex justify-end gap-2">\n              <UButton type="button" color="neutral" variant="ghost" @click="slideoverOpen = false">\n                Anuluj\n              </UButton>\n              <UButton type="submit">\n                Zapisz\n              </UButton>\n            </div>\n          </UForm>\n        </template>\n      </USlideover>\n    </template>\n  </UDashboardPanel>\n</template>\n`
}

function renderVueFormField(field: ModuleField): string {
  const label = field.label || field.name
  const required = field.required ? ' required' : ''

  if (field.type === 'integer' || field.type === 'number') {
    return `            <UFormField label="${label}" name="${field.name}"${required}>\n              <UInputNumber v-model="state.${field.name}" class="w-full" />\n            </UFormField>`
  }

  if (field.type === 'boolean') {
    return `            <UFormField label="${label}" name="${field.name}"${required}>\n              <USwitch v-model="state.${field.name}" />\n            </UFormField>`
  }

  if (field.type === 'enum') {
    const items = JSON.stringify((field.values || []).map(value => ({ label: value, value })))

    return `            <UFormField label="${label}" name="${field.name}"${required}>\n              <USelect v-model="state.${field.name}" :items='${items}' class="w-full" />\n            </UFormField>`
  }

  if (field.type === 'text' || field.type === 'json') {
    return `            <UFormField label="${label}" name="${field.name}"${required}>\n              <UTextarea v-model="state.${field.name}" class="w-full" />\n            </UFormField>`
  }

  return `            <UFormField label="${label}" name="${field.name}"${required}>\n              <UInput v-model="state.${field.name}" class="w-full" />\n            </UFormField>`
}

function defaultValueForField(field: ModuleField): unknown {
  if (field.type === 'boolean') {
    return false
  }

  if (field.type === 'integer' || field.type === 'number') {
    return 0
  }

  if (field.type === 'json') {
    return '{}'
  }

  if (field.type === 'enum') {
    return field.values?.[0] || ''
  }

  return ''
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

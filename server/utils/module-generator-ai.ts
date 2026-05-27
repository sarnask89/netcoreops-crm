import type { ModuleDefinition, ModuleField } from '../../scripts/codegen/module-generator'
import { validateDefinition } from '../../scripts/codegen/module-generator'

const reservedFieldNames = new Set(['id', 'createdAt', 'updatedAt'])

const typeAliases: Record<string, ModuleField['type']> = {
  decimal: 'number',
  double: 'number',
  float: 'number',
  string: 'varchar',
  object: 'json'
}

function words(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .map(word => word.trim())
    .filter(Boolean)
}

function titleWord(value: string): string {
  const lower = value.toLowerCase()

  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`
}

function toCamelCase(value: string, fallback: string): string {
  const parts = words(value)

  if (parts.length === 0) {
    return fallback
  }

  return parts
    .map((part, index) => index === 0 ? part.toLowerCase() : titleWord(part))
    .join('')
    .replace(/^[^a-z]+/, '') || fallback
}

function toSnakeCase(value: string, fallback: string): string {
  const parts = words(value)

  if (parts.length === 0) {
    return fallback
  }

  return parts.map(part => part.toLowerCase()).join('_')
}

function toKebabCase(value: string, fallback: string): string {
  const snake = toSnakeCase(value, fallback.replace(/-/g, '_'))

  return snake.replace(/_/g, '-')
}

function cleanRoute(value: unknown, fallback: string): string {
  const raw = typeof value === 'string' ? value : fallback
  const segments = raw
    .split(/[\\/]+/)
    .map(segment => segment.trim())
    .filter(segment => segment && segment !== '..' && segment !== '.')
    .map(segment => toKebabCase(segment, 'module'))

  return segments.length > 0 ? segments.join('/') : fallback
}

function cleanPage(value: unknown, fallback: string): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const raw = value
    .trim()
    .replace(/\.vue$/i, '')
    .replace(/^app[\\/]pages[\\/]/i, '')
    .replace(/^pages[\\/]/i, '')

  const page = cleanRoute(raw, fallback)

  return page === fallback ? undefined : page
}

function normalizeType(value: unknown): ModuleField['type'] {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : 'text'
  const alias = typeAliases[raw]

  if (alias) {
    return alias
  }

  if (['uuid', 'text', 'varchar', 'integer', 'number', 'boolean', 'timestamp', 'date', 'json', 'enum'].includes(raw)) {
    return raw as ModuleField['type']
  }

  return 'text'
}

function humanLabel(value: string): string {
  return words(value).map(titleWord).join(' ') || value
}

function asObjectArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : []
}

function normalizeField(input: Record<string, unknown>, usedNames: Set<string>): ModuleField | null {
  const rawName = String(input.name || input.label || 'field')
  const name = toCamelCase(rawName, 'field')

  if (reservedFieldNames.has(name) || usedNames.has(name)) {
    return null
  }

  usedNames.add(name)

  const type = normalizeType(input.type)
  const values = Array.isArray(input.values)
    ? input.values.map(value => String(value).trim()).filter(Boolean)
    : []

  const field: ModuleField = {
    name,
    label: typeof input.label === 'string' && input.label.trim() ? input.label.trim() : humanLabel(name),
    type,
    required: typeof input.required === 'boolean' ? input.required : undefined,
    max: typeof input.max === 'number' && Number.isInteger(input.max) && input.max > 0 ? input.max : undefined,
    values: type === 'enum' ? (values.length > 0 ? values : ['ACTIVE', 'INACTIVE']) : undefined,
    default: typeof input.default === 'string' || typeof input.default === 'number' || typeof input.default === 'boolean' || input.default === null
      ? input.default
      : undefined,
    list: typeof input.list === 'boolean' ? input.list : undefined,
    form: typeof input.form === 'boolean' ? input.form : undefined
  }

  return Object.fromEntries(
    Object.entries(field).filter(([, value]) => value !== undefined)
  ) as ModuleField
}

export function parseAiModuleJson(input: string): ModuleDefinition {
  const parsed = JSON.parse(input) as Record<string, unknown>

  return normalizeAiModuleDefinition(parsed)
}

export function normalizeAiModuleDefinition(input: Record<string, unknown>): ModuleDefinition {
  const module = toCamelCase(String(input.module || input.title || input.tableName || 'generatedModule'), 'generatedModule')
  const tableName = toSnakeCase(String(input.tableName || module), 'generated_module')
  const route = cleanRoute(input.route, toKebabCase(tableName, 'generated-module'))
  const usedNames = new Set<string>()
  const fields = asObjectArray(input.fields)
    .map(field => normalizeField(field, usedNames))
    .filter((field): field is ModuleField => Boolean(field))

  const definition: ModuleDefinition = {
    module,
    title: String(input.title || humanLabel(module)),
    tableName,
    route,
    page: cleanPage(input.page, route),
    description: input.description === undefined ? undefined : String(input.description),
    timestamps: typeof input.timestamps === 'boolean' ? input.timestamps : true,
    fields: fields.length > 0
      ? fields
      : [{ name: 'name', label: 'Name', type: 'varchar', required: true, max: 255, list: true, form: true }]
  }

  return validateDefinition(definition)
}

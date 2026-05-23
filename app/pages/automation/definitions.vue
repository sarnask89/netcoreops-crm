<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface VariableDefinitionRow {
  id: number
  variableName: string
  label?: string | null
  valueType: 'string' | 'int' | 'date' | 'bool'
  sourceType: 'STATIC' | 'DATABASE'
  tableName?: string | null
  rowLookupColumn?: string | null
  rowLookupValue?: string | null
  fieldName?: string | null
  staticValue?: string | null
  fallbackValue?: string | null
  isActive: boolean
}

interface SourceCatalogEntry {
  label: string
  lookupColumns: string[]
  fields: string[]
}

interface SourcesResponse {
  success: boolean
  data: Record<string, SourceCatalogEntry>
}

const toast = useToast()
const variableOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedVariable = ref<VariableDefinitionRow | null>(null)
const detailsOpen = ref(false)

const variableSchema = z.object({
  variableName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  label: z.string().optional(),
  valueType: z.enum(['string', 'int', 'date', 'bool']),
  sourceType: z.enum(['STATIC', 'DATABASE']),
  tableName: z.string().optional(),
  rowLookupColumn: z.string().optional(),
  rowLookupValue: z.string().optional(),
  fieldName: z.string().optional(),
  staticValue: z.string().optional(),
  fallbackValue: z.string().optional(),
  isActive: z.boolean()
})

type VariableSchema = z.output<typeof variableSchema>

const variableState = reactive<Partial<VariableSchema>>({
  sourceType: 'DATABASE',
  valueType: 'string',
  isActive: true
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: VariableDefinitionRow[] }>('/api/automation/variables', {
  default: () => ({ success: false, data: [] })
})
const { data: sources } = await useFetch<SourcesResponse>('/api/automation/variables/sources', {
  default: () => ({ success: false, data: {} })
})

const tableItems = computed(() => Object.entries(sources.value.data).map(([value, source]) => ({
  label: source.label,
  value
})))
const selectedSource = computed(() => variableState.tableName ? sources.value.data[variableState.tableName] : null)
const lookupColumnItems = computed(() => selectedSource.value?.lookupColumns || [])
const fieldItems = computed(() => selectedSource.value?.fields || [])

const columns: TableColumn<VariableDefinitionRow>[] = [
  { accessorKey: 'variableName', header: 'Zmienna' },
  { accessorKey: 'label', header: 'Opis' },
  { accessorKey: 'valueType', header: 'Typ' },
  {
    id: 'source',
    header: 'Źródło',
    cell: ({ row }) => row.original.sourceType === 'STATIC'
      ? `static:${row.original.staticValue || ''}`
      : `${row.original.tableName}|${row.original.rowLookupColumn}=${row.original.rowLookupValue}|${row.original.fieldName}`
  },
  {
    id: 'active',
    header: 'Aktywna',
    cell: ({ row }) => row.original.isActive ? 'Tak' : 'Nie'
  }
]

function resetForm() {
  editingId.value = null
  Object.assign(variableState, {
    variableName: '',
    label: '',
    sourceType: 'DATABASE',
    valueType: 'string',
    tableName: undefined,
    rowLookupColumn: undefined,
    rowLookupValue: '',
    fieldName: undefined,
    staticValue: '',
    fallbackValue: '',
    isActive: true
  })
}

function editVariable(variable: VariableDefinitionRow) {
  editingId.value = variable.id
  Object.assign(variableState, {
    variableName: variable.variableName,
    label: variable.label || '',
    sourceType: variable.sourceType,
    valueType: variable.valueType,
    tableName: variable.tableName || undefined,
    rowLookupColumn: variable.rowLookupColumn || undefined,
    rowLookupValue: variable.rowLookupValue || '',
    fieldName: variable.fieldName || undefined,
    staticValue: variable.staticValue || '',
    fallbackValue: variable.fallbackValue || '',
    isActive: variable.isActive
  })
  variableOpen.value = true
}

function showDetails(variable: VariableDefinitionRow) {
  selectedVariable.value = variable
  detailsOpen.value = true
}

function rowContextItems(row: VariableDefinitionRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj definicję', icon: 'i-lucide-pencil', onSelect: () => editVariable(row) },
    { label: 'Szczegóły definicji', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) }
  ], [
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}

async function saveVariable(event: FormSubmitEvent<VariableSchema>) {
  const body = {
    ...event.data,
    tableName: event.data.sourceType === 'DATABASE' ? event.data.tableName : null,
    rowLookupColumn: event.data.sourceType === 'DATABASE' ? event.data.rowLookupColumn : null,
    rowLookupValue: event.data.sourceType === 'DATABASE' ? event.data.rowLookupValue : null,
    fieldName: event.data.sourceType === 'DATABASE' ? event.data.fieldName : null,
    staticValue: event.data.sourceType === 'STATIC' ? event.data.staticValue : null
  }

  if (editingId.value) {
    await $fetch(`/api/automation/variables/${editingId.value}`, { method: 'PATCH', body })
  } else {
    await $fetch('/api/automation/variables', { method: 'POST', body })
  }

  toast.add({ title: 'Definicja zapisana', color: 'success' })
  variableOpen.value = false
  resetForm()
  await refresh()
}
</script>

<template>
  <UDashboardPanel id="automation-definitions" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Definicje zmiennych">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="variableOpen" title="Definicja zmiennej">
            <UButton label="Dodaj definicję" icon="i-lucide-braces" @click="resetForm" />
            <template #body>
              <UForm
                :schema="variableSchema"
                :state="variableState"
                class="space-y-4"
                @submit="saveVariable"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Nazwa zmiennej" name="variableName" required>
                    <UInput v-model="variableState.variableName" class="w-full" />
                  </UFormField>
                  <UFormField label="Aktywna" name="isActive">
                    <USwitch v-model="variableState.isActive" />
                  </UFormField>
                </div>
                <UFormField label="Opis" name="label">
                  <UInput v-model="variableState.label" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Typ źródła" name="sourceType">
                    <USelect v-model="variableState.sourceType" :items="['DATABASE', 'STATIC']" class="w-full" />
                  </UFormField>
                  <UFormField label="Typ danych" name="valueType">
                    <USelect v-model="variableState.valueType" :items="['string', 'int', 'date', 'bool']" class="w-full" />
                  </UFormField>
                </div>

                <template v-if="variableState.sourceType === 'DATABASE'">
                  <UFormField label="Tabela" name="tableName" required>
                    <USelect v-model="variableState.tableName" :items="tableItems" class="w-full" />
                  </UFormField>
                  <div class="grid gap-4 md:grid-cols-2">
                    <UFormField label="Kolumna wyboru wiersza" name="rowLookupColumn" required>
                      <USelect v-model="variableState.rowLookupColumn" :items="lookupColumnItems" class="w-full" />
                    </UFormField>
                    <UFormField label="Wartość wiersza" name="rowLookupValue" required>
                      <UInput v-model="variableState.rowLookupValue" class="w-full" />
                    </UFormField>
                  </div>
                  <UFormField label="Pole do podstawienia" name="fieldName" required>
                    <USelect v-model="variableState.fieldName" :items="fieldItems" class="w-full" />
                  </UFormField>
                </template>

                <template v-else>
                  <UFormField label="Tekst statyczny" name="staticValue" required>
                    <UTextarea v-model="variableState.staticValue" class="w-full" :rows="4" />
                  </UFormField>
                </template>

                <UFormField label="Wartość awaryjna" name="fallbackValue">
                  <UInput v-model="variableState.fallbackValue" class="w-full" />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <AppDataTable
        :data="data.data"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły definicji"
        :subtitle="selectedVariable?.variableName"
        :item="selectedVariable"
      />
    </template>
  </UDashboardPanel>
</template>

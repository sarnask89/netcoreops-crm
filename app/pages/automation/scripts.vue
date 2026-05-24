<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface AutomationScriptRow {
  id: number
  name: string
  scope: string
  triggerType: string
  scriptLanguage: string
  scriptBody: string
  isEnabled: boolean
  timeoutSeconds: number
  lastRunAt?: string | null
  profileId?: number | null
  equipmentId?: string | null
  profile?: { id: number, name: string } | null
  equipment?: { id: string, inventoryId: string, hostname?: string | null, managementIp?: string | null } | null
}

interface OptionsResponse {
  success: boolean
  data: {
    profiles: Array<{ id: number, name: string }>
    equipment: Array<{ id: string, inventoryId: string, hostname?: string | null, managementIp?: string | null }>
  }
}

interface VariableDefinition {
  variableName: string
  label?: string | null
  valueType: 'string' | 'int' | 'date' | 'bool'
}

const toast = useToast()
const scriptOpen = ref(false)
const renderOpen = ref(false)
const detailsOpen = ref(false)
const selectedScript = ref<AutomationScriptRow | null>(null)
const selectedScriptId = ref<number>()
const editingScriptId = ref<number | null>(null)
const renderedBody = ref('')
const renderedVariables = ref<Record<string, string>>({})
const triggerTypeItems = ['MANUAL', 'PROFILE_APPLIED', 'SERVICE_ACTIVATED', 'DEVICE_DISCOVERED', 'SCHEDULED_30_MIN'] as const
const scriptLanguageItems = ['bash', 'python', 'ansible', 'expect', 'typescript', 'tsx'] as const

const scriptSchema = z.object({
  name: z.string().min(1),
  scope: z.enum(['DEVICE', 'PROFILE', 'CUSTOMER_SERVICE']),
  triggerType: z.enum(triggerTypeItems),
  scriptLanguage: z.enum(scriptLanguageItems),
  scriptBody: z.string().min(1),
  profileId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  isEnabled: z.boolean(),
  timeoutSeconds: z.number().int().positive().max(3600)
})

type ScriptSchema = z.output<typeof scriptSchema>

const scriptState = reactive<Partial<ScriptSchema>>({
  scope: 'DEVICE',
  triggerType: 'MANUAL',
  scriptLanguage: 'bash',
  isEnabled: false,
  timeoutSeconds: 60,
  scriptBody: 'if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]'
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: AutomationScriptRow[] }>('/api/automation/scripts', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { profiles: [], equipment: [] } })
})
const { data: variables } = await useFetch<{ success: boolean, data: VariableDefinition[] }>('/api/automation/variables', {
  default: () => ({ success: false, data: [] })
})

const profileItems = computed(() => [
  { label: 'Bez profilu', value: null },
  ...options.value.data.profiles.map(profile => ({ label: profile.name, value: profile.id }))
])
const equipmentItems = computed(() => [
  { label: 'Bez urządzenia', value: null },
  ...options.value.data.equipment.map(equipment => ({
    label: [equipment.inventoryId, equipment.hostname || equipment.managementIp].filter(Boolean).join(' - '),
    value: equipment.id
  }))
])
const scriptItems = computed(() => data.value.data.map(script => ({
  label: script.name,
  value: script.id
})))

const columns: TableColumn<AutomationScriptRow>[] = [
  { accessorKey: 'name', header: 'Skrypt' },
  { accessorKey: 'scope', header: 'Zakres' },
  { accessorKey: 'triggerType', header: 'Wyzwalacz' },
  { accessorKey: 'scriptLanguage', header: 'Język' },
  { accessorKey: 'profile.name', header: 'Profil' },
  {
    id: 'equipment',
    header: 'Urządzenie',
    cell: ({ row }) => row.original.equipment?.inventoryId || 'Brak'
  },
  {
    id: 'enabled',
    header: 'Aktywny',
    cell: ({ row }) => row.original.isEnabled ? 'Tak' : 'Nie'
  },
  {
    id: 'timeout',
    header: 'Timeout',
    cell: ({ row }) => `${row.original.timeoutSeconds}s`
  },
  {
    id: 'lastRun',
    header: 'Ostatni przebieg',
    cell: ({ row }) => row.original.lastRunAt ? new Date(row.original.lastRunAt).toLocaleString('pl-PL') : 'Brak'
  }
]
const variableColumns: TableColumn<{ name: string, value: string }>[] = [
  { accessorKey: 'name', header: 'Zmienna' },
  { accessorKey: 'value', header: 'Wartość' }
]
const scriptContextItems = computed<ContextMenuItem[][]>(() => {
  const variableItems = variables.value.data.map(variable => ({
    label: `${variable.variableName} (${variable.valueType})`,
    icon: 'i-lucide-braces',
    onSelect: () => insertScriptText(`{{${variable.variableName}}}`)
  }))
  const conditionItems = variables.value.data.map(variable => ({
    label: `if $${variable.variableName}=true [ ]`,
    icon: 'i-lucide-git-branch',
    onSelect: () => insertScriptText(`if $${variable.variableName}=true [  ]`)
  }))

  return [variableItems, conditionItems]
})

function resetScriptForm() {
  editingScriptId.value = null
  selectedScript.value = null
  Object.assign(scriptState, {
    name: undefined,
    scope: 'DEVICE',
    triggerType: 'MANUAL',
    scriptLanguage: 'bash',
    scriptBody: 'if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]',
    profileId: null,
    equipmentId: null,
    isEnabled: false,
    timeoutSeconds: 60
  })
}

function openCreateScript() {
  resetScriptForm()
  scriptOpen.value = true
}

function openEditScript(row: AutomationScriptRow) {
  selectedScript.value = row
  editingScriptId.value = row.id
  Object.assign(scriptState, {
    name: row.name,
    scope: row.scope as ScriptSchema['scope'],
    triggerType: row.triggerType as ScriptSchema['triggerType'],
    scriptLanguage: row.scriptLanguage as ScriptSchema['scriptLanguage'],
    scriptBody: row.scriptBody,
    profileId: row.profile?.id || row.profileId || null,
    equipmentId: row.equipment?.id || row.equipmentId || null,
    isEnabled: row.isEnabled,
    timeoutSeconds: row.timeoutSeconds
  })
  scriptOpen.value = true
}

async function saveScript(event: FormSubmitEvent<ScriptSchema>) {
  await $fetch(editingScriptId.value ? `/api/automation/scripts/${editingScriptId.value}` : '/api/automation/scripts', {
    method: editingScriptId.value ? 'PATCH' : 'POST',
    body: {
      ...event.data,
      profileId: event.data.profileId || null,
      equipmentId: event.data.equipmentId || null
    }
  })
  toast.add({ title: 'Skrypt zapisany', color: 'success' })
  scriptOpen.value = false
  resetScriptForm()
  await refresh()
}

async function deleteScript(row: AutomationScriptRow) {
  if (!window.confirm(`Usunąć skrypt ${row.name}?`)) return
  await $fetch(`/api/automation/scripts/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Skrypt usunięty', color: 'success' })
  await refresh()
}

async function renderScript() {
  if (!selectedScriptId.value) {
    toast.add({ title: 'Wybierz skrypt', color: 'warning' })
    return
  }

  const response = await $fetch<{
    success: boolean
    data: { renderedBody: string, variables: Record<string, string> }
  }>(`/api/automation/scripts/${selectedScriptId.value}/render`, {
    method: 'POST',
    body: { variables: {} }
  })

  renderedBody.value = response.data.renderedBody
  renderedVariables.value = response.data.variables
}

async function runScript(row: AutomationScriptRow) {
  try {
    const response = await $fetch<{
      success: boolean
      data: { equipmentScanned: number, onusScanned: number, alerts: unknown[] }
    }>(`/api/automation/scripts/${row.id}/run`, { method: 'POST' })
    toast.add({
      title: 'Skrypt uruchomiony',
      description: `OLT: ${response.data.equipmentScanned}, ONU: ${response.data.onusScanned}, alerty: ${response.data.alerts.length}`,
      color: response.data.alerts.length ? 'warning' : 'success'
    })
    await refresh()
  } catch (error) {
    const message = error && typeof error === 'object' && 'statusMessage' in error
      ? String(error.statusMessage)
      : 'Nie udało się uruchomić skryptu'
    toast.add({ title: message, color: 'error' })
  }
}

function showDetails(row: AutomationScriptRow) {
  selectedScript.value = row
  detailsOpen.value = true
}

function openRenderFor(row: AutomationScriptRow) {
  selectedScriptId.value = row.id
  renderOpen.value = true
}

function rowContextItems(row: AutomationScriptRow): ContextMenuItem[][] {
  return [[
    { label: 'Uruchom teraz', icon: 'i-lucide-play', onSelect: () => runScript(row) },
    { label: 'Edytuj skrypt', icon: 'i-lucide-pencil', onSelect: () => openEditScript(row) },
    { label: 'Szczegóły skryptu', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Renderuj skrypt', icon: 'i-lucide-play', onSelect: () => openRenderFor(row) }
  ], [
    { label: 'Usuń skrypt', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteScript(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}

async function insertScriptText(text: string) {
  const currentValue = scriptState.scriptBody || ''
  const activeElement = document.activeElement

  if (activeElement instanceof HTMLTextAreaElement && activeElement.value === currentValue) {
    const start = activeElement.selectionStart
    const end = activeElement.selectionEnd
    scriptState.scriptBody = `${currentValue.slice(0, start)}${text}${currentValue.slice(end)}`
    await nextTick()
    activeElement.selectionStart = start + text.length
    activeElement.selectionEnd = start + text.length
    activeElement.focus()
    return
  }

  scriptState.scriptBody = `${currentValue}${currentValue ? '\n' : ''}${text}`
}
</script>

<template>
  <UDashboardPanel id="automation-scripts" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Automatyzacja">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="renderOpen" title="Podgląd skryptu">
            <UButton label="Podgląd" icon="i-lucide-eye" variant="subtle" />
            <template #body>
              <div class="space-y-4">
                <UFormField label="Skrypt">
                  <USelect v-model="selectedScriptId" :items="scriptItems" class="w-full" />
                </UFormField>
                <UButton label="Renderuj" icon="i-lucide-play" @click="renderScript" />
                <UFormField label="Wynik">
                  <UTextarea
                    v-model="renderedBody"
                    class="w-full font-mono"
                    :rows="12"
                    readonly
                  />
                </UFormField>
                <UTable
                  :data="Object.entries(renderedVariables).map(([name, value]) => ({ name, value }))"
                  :columns="variableColumns"
                />
              </div>
            </template>
          </USlideover>

          <USlideover v-model:open="scriptOpen" :title="editingScriptId ? 'Edytuj skrypt' : 'Dodaj skrypt automatyzacji'">
            <UButton label="Dodaj skrypt" icon="i-lucide-file-terminal" @click="openCreateScript" />
            <template #body>
              <UForm
                :schema="scriptSchema"
                :state="scriptState"
                class="space-y-4"
                @submit="saveScript"
              >
                <UFormField label="Nazwa" name="name" required>
                  <UInput v-model="scriptState.name" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Zakres" name="scope">
                    <USelect
                      v-model="scriptState.scope"
                      :items="['DEVICE', 'PROFILE', 'CUSTOMER_SERVICE']"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Wyzwalacz" name="triggerType">
                    <USelect
                      v-model="scriptState.triggerType"
                      :items="[...triggerTypeItems]"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Język" name="scriptLanguage">
                    <USelect
                      v-model="scriptState.scriptLanguage"
                      :items="[...scriptLanguageItems]"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Timeout s" name="timeoutSeconds">
                    <UInputNumber v-model="scriptState.timeoutSeconds" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Profil" name="profileId">
                  <USelect v-model="scriptState.profileId" :items="profileItems" class="w-full" />
                </UFormField>
                <UFormField label="Urządzenie" name="equipmentId">
                  <USelect v-model="scriptState.equipmentId" :items="equipmentItems" class="w-full" />
                </UFormField>
                <UFormField label="Aktywny" name="isEnabled">
                  <USwitch v-model="scriptState.isEnabled" />
                </UFormField>
                <UFormField label="Treść skryptu" name="scriptBody" required>
                  <UContextMenu :items="scriptContextItems">
                    <UTextarea v-model="scriptState.scriptBody" class="w-full font-mono" :rows="14" />
                  </UContextMenu>
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
        title="Szczegóły skryptu"
        :subtitle="selectedScript?.name"
        :item="selectedScript"
      />
    </template>
  </UDashboardPanel>
</template>

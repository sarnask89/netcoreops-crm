<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface ModuleDefinition {
  module: string
  title: string
  tableName: string
  route: string
  fields: Array<{ name: string, type: string, label?: string }>
}

interface GeneratedFileRow {
  path: string
  kind?: string
  content: string
}

interface ValidationReport {
  success: boolean
  phase: string
  errors: string[]
  warnings: string[]
}

interface ModulePlan {
  modules: ModuleDefinition[]
  files: GeneratedFileRow[]
  validation: ValidationReport
}

const toast = useToast()
const active = ref('spec')
const specInput = ref(`{
  "module": "helpdeskTickets",
  "title": "Zgloszenia",
  "tableName": "helpdesk_tickets",
  "route": "helpdesk/tickets",
  "fields": [
    { "name": "subject", "label": "Temat", "type": "varchar", "required": true, "max": 180 }
  ]
}`)
const specFormat = ref<'json' | 'xml'>('json')
const pathInput = ref('')
const force = ref(false)
const parsedDefinition = ref<ModuleDefinition | null>(null)
const plan = ref<ModulePlan | null>(null)
const validation = computed(() => plan.value?.validation || null)
const loading = ref(false)
const previewOpen = ref(false)
const previewFile = ref<GeneratedFileRow | null>(null)

const tabs = [
  { label: 'Spec', value: 'spec', icon: 'i-lucide-file-code-2' },
  { label: 'Plan', value: 'plan', icon: 'i-lucide-list-checks' },
  { label: 'Walidacja', value: 'validation', icon: 'i-lucide-shield-check' }
]

const formatItems = [
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' }
]

const fileColumns: TableColumn<GeneratedFileRow>[] = [
  { accessorKey: 'path', header: 'Plik' },
  { accessorKey: 'kind', header: 'Typ' }
]

const paths = computed(() => pathInput.value
  .split('\n')
  .map(path => path.trim())
  .filter(Boolean))

async function parseSpec() {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean, data: ModuleDefinition }>('/api/module-generator/parse', {
      method: 'POST',
      body: {
        input: specInput.value,
        format: specFormat.value
      }
    })
    parsedDefinition.value = response.data
    toast.add({ title: 'Specyfikacja poprawna', color: 'success' })
  } finally {
    loading.value = false
  }
}

async function buildPlan() {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean, data: ModulePlan }>('/api/module-generator/plan', {
      method: 'POST',
      body: {
        paths: paths.value,
        force: force.value
      }
    })
    plan.value = response.data
    toast.add({
      title: response.data.validation.success ? 'Plan poprawny' : 'Plan wymaga poprawek',
      color: response.data.validation.success ? 'success' : 'error'
    })
    active.value = response.data.validation.success ? 'plan' : 'validation'
  } finally {
    loading.value = false
  }
}

async function copyPath(row: GeneratedFileRow) {
  await navigator.clipboard.writeText(row.path)
  toast.add({ title: 'Skopiowano sciezke', color: 'success' })
}

function showPreview(row: GeneratedFileRow) {
  previewFile.value = row
  previewOpen.value = true
}

function fileContextItems(row: GeneratedFileRow): ContextMenuItem[][] {
  return [[
    { label: 'Kopiuj sciezke', icon: 'i-lucide-copy', onSelect: () => copyPath(row) },
    { label: 'Pokaz podglad', icon: 'i-lucide-panel-right-open', onSelect: () => showPreview(row) }
  ]]
}
</script>

<template>
  <UDashboardPanel id="tools-module-generator" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Generator modulow">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UTabs v-model="active" :items="tabs" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div v-if="active === 'spec'" class="grid h-full min-h-0 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="flex min-h-0 flex-col gap-3">
          <div class="flex items-center gap-2">
            <USelect v-model="specFormat" :items="formatItems" class="w-36" />
            <UButton
              label="Parse"
              icon="i-lucide-play"
              :loading="loading"
              @click="parseSpec"
            />
          </div>
          <UTextarea
            v-model="specInput"
            class="min-h-[520px] font-mono"
            :rows="24"
          />
        </div>

        <div class="space-y-3 border border-default rounded-lg p-3">
          <p class="text-sm font-medium text-highlighted">
            Wynik parsera
          </p>
          <div v-if="parsedDefinition" class="space-y-2 text-sm">
            <p><span class="text-muted">Modul:</span> {{ parsedDefinition.module }}</p>
            <p><span class="text-muted">Tabela:</span> {{ parsedDefinition.tableName }}</p>
            <p><span class="text-muted">Route:</span> {{ parsedDefinition.route }}</p>
            <p><span class="text-muted">Pola:</span> {{ parsedDefinition.fields.length }}</p>
          </div>
          <UAlert
            v-else
            color="neutral"
            variant="subtle"
            title="Brak sparsowanej specyfikacji"
            description="Wklej JSON albo XML i uruchom parser."
          />
        </div>
      </div>

      <div v-else-if="active === 'plan'" class="grid h-full min-h-0 gap-4 overflow-hidden p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div class="space-y-4 overflow-auto">
          <UFormField label="Pliki definicji" name="paths">
            <UTextarea
              v-model="pathInput"
              :rows="10"
              placeholder="/home/sarna/netcoreops/scripts/module-definitions/example-helpdesk-tickets.json"
              class="font-mono"
            />
          </UFormField>
          <USwitch v-model="force" label="Pozwol nadpisac istniejace pliki" />
          <UButton
            label="Dry-run plan"
            icon="i-lucide-list-checks"
            :loading="loading"
            :disabled="paths.length === 0"
            @click="buildPlan"
          />
        </div>

        <AppDataTable
          :data="plan?.files || []"
          :columns="fileColumns"
          :loading="loading"
          :context-items="fileContextItems"
          empty-label="Brak planu plikow"
        />
      </div>

      <div v-else class="space-y-4 overflow-auto p-4">
        <UAlert
          v-if="validation"
          :color="validation.success ? 'success' : 'error'"
          variant="subtle"
          :title="validation.success ? 'Walidacja poprawna' : 'Walidacja nie powiodla sie'"
          :description="`Faza: ${validation.phase}`"
        />
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          title="Brak raportu walidacji"
          description="Uruchom dry-run planu, zeby zobaczyc wynik."
        />

        <div v-if="validation?.errors.length" class="space-y-2">
          <p class="text-sm font-medium text-error">
            Bledy
          </p>
          <ul class="space-y-1 text-sm text-default">
            <li v-for="error in validation.errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>

        <div v-if="validation?.warnings.length" class="space-y-2">
          <p class="text-sm font-medium text-warning">
            Ostrzezenia
          </p>
          <ul class="space-y-1 text-sm text-default">
            <li v-for="warning in validation.warnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <USlideover v-model:open="previewOpen" :title="previewFile?.path || 'Podglad pliku'">
    <template #body>
      <UTextarea
        :model-value="previewFile?.content || ''"
        readonly
        :rows="28"
        class="font-mono"
      />
    </template>
  </USlideover>
</template>

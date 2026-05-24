<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'

type SpecFormat = 'json' | 'xml'

interface ModuleDefinition {
  module: string
  title: string
  tableName: string
  route: string
  page?: string
  description?: string
  timestamps?: boolean
  fields: Array<{
    name: string
    label?: string
    type: string
    required?: boolean
    max?: number
    values?: string[]
    default?: string | number | boolean | null
    list?: boolean
    form?: boolean
  }>
}

interface GeneratedFile {
  path: string
  content: string
  kind?: string
}

interface ValidationReport {
  success: boolean
  phase: string
  errors: string[]
  warnings: string[]
}

interface ModuleGenerationPlan {
  modules: ModuleDefinition[]
  files: GeneratedFile[]
  validation: ValidationReport
}

const toast = useToast()

const tabs = [
  {
    label: 'Spec',
    icon: 'i-lucide-file-code',
    slot: 'spec'
  },
  {
    label: 'Plan',
    icon: 'i-lucide-list-tree',
    slot: 'plan'
  },
  {
    label: 'Walidacja',
    icon: 'i-lucide-shield-check',
    slot: 'validation'
  }
]

const formatOptions = [
  {
    label: 'JSON',
    value: 'json'
  },
  {
    label: 'XML',
    value: 'xml'
  }
]

const specFormat = ref<SpecFormat>('json')
const specInput = ref(`{
  "module": "fiberTickets",
  "title": "Awaria FTTH",
  "tableName": "fiber_tickets",
  "route": "network/fiber-tickets",
  "timestamps": true,
  "fields": [
    {
      "name": "subject",
      "label": "Temat",
      "type": "varchar",
      "required": true,
      "max": 120
    },
    {
      "name": "status",
      "label": "Status",
      "type": "enum",
      "default": "OPEN",
      "values": ["OPEN", "CLOSED"]
    }
  ]
}`)

const parsedDefinition = ref<ModuleDefinition | null>(null)
const pathsText = ref('')
const force = ref(false)
const loading = ref(false)
const plan = ref<ModuleGenerationPlan | null>(null)
const previewOpen = ref(false)
const previewFile = ref<GeneratedFile | null>(null)
const activeFile = ref<GeneratedFile | null>(null)

const fileColumns = [
  {
    accessorKey: 'path',
    header: 'Path'
  },
  {
    accessorKey: 'kind',
    header: 'Kind'
  }
]

const planFiles = computed(() => plan.value?.files || [])
const validation = computed<ValidationReport | null>(() => plan.value?.validation || null)

function inputPaths(): string[] {
  return pathsText.value
    .split('\n')
    .map(path => path.trim())
    .filter(Boolean)
}

async function parseSpec(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<{ success: true, data: ModuleDefinition }>('/api/module-generator/parse', {
      method: 'POST',
      body: {
        input: specInput.value,
        format: specFormat.value
      }
    })

    parsedDefinition.value = response.data

    toast.add({
      title: 'Spec sparsowany',
      description: response.data.module,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Blad parsowania',
      description: error instanceof Error ? error.message : 'Nie udalo sie sparsowac spec',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function dryRunPlan(): Promise<void> {
  const paths = inputPaths()

  if (paths.length === 0) {
    toast.add({
      title: 'Brak sciezek',
      description: 'Dodaj jeden path na linie.',
      color: 'warning'
    })

    return
  }

  loading.value = true

  try {
    const response = await $fetch<{ success: true, data: ModuleGenerationPlan }>('/api/module-generator/plan', {
      method: 'POST',
      body: {
        paths,
        force: force.value
      }
    })

    plan.value = response.data

    toast.add({
      title: 'Plan wygenerowany',
      description: `${response.data.files.length} plikow w planie`,
      color: response.data.validation.success ? 'success' : 'warning'
    })
  } catch (error) {
    toast.add({
      title: 'Blad planowania',
      description: error instanceof Error ? error.message : 'Nie udalo sie wygenerowac planu',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function onFileRowContext(file: GeneratedFile): void {
  activeFile.value = file
}

function openPreview(file: GeneratedFile): void {
  previewFile.value = file
  previewOpen.value = true
}

async function copyPath(file: GeneratedFile): Promise<void> {
  await navigator.clipboard.writeText(file.path)

  toast.add({
    title: 'Skopiowano sciezke',
    description: file.path,
    color: 'success'
  })
}

function fileContextItems(file?: GeneratedFile | null): ContextMenuItem[][] {
  const target = file || activeFile.value

  return [
    [
      {
        label: 'Kopiuj sciezke',
        icon: 'i-lucide-copy',
        disabled: !target,
        onSelect: () => target ? copyPath(target) : undefined
      },
      {
        label: 'Pokaz podglad',
        icon: 'i-lucide-eye',
        disabled: !target,
        onSelect: () => target ? openPreview(target) : undefined
      }
    ]
  ]
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Generator modulow">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTabs :items="tabs" class="w-full">
        <template #spec>
          <div class="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div class="space-y-4">
              <UFormField label="Spec JSON/XML" name="specInput">
                <UTextarea
                  v-model="specInput"
                  :rows="22"
                  class="w-full font-mono"
                  placeholder="Wklej ModuleDefinition JSON albo XML"
                />
              </UFormField>
            </div>

            <div class="space-y-4">
              <UFormField label="Format" name="specFormat">
                <USelect
                  v-model="specFormat"
                  :items="formatOptions"
                  class="w-full"
                />
              </UFormField>

              <UButton
                block
                icon="i-lucide-scan-text"
                :loading="loading"
                @click="parseSpec"
              >
                Parse
              </UButton>

              <UAlert
                v-if="parsedDefinition"
                color="success"
                variant="soft"
                title="Definicja poprawna"
                :description="`${parsedDefinition.module} | ${parsedDefinition.tableName} | ${parsedDefinition.route}`"
              />

              <div v-if="parsedDefinition" class="rounded-lg border border-default p-4 text-sm">
                <dl class="space-y-2">
                  <div class="flex justify-between gap-4">
                    <dt class="text-muted">
                      Modul
                    </dt>
                    <dd class="font-medium">
                      {{ parsedDefinition.module }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-muted">
                      Tabela
                    </dt>
                    <dd class="font-medium">
                      {{ parsedDefinition.tableName }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-muted">
                      Route
                    </dt>
                    <dd class="font-medium">
                      {{ parsedDefinition.route }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </template>

        <template #plan>
          <div class="space-y-4">
            <div class="grid gap-4 lg:grid-cols-[1fr_260px]">
              <UFormField label="Sciezki definicji, jedna na linie" name="pathsText">
                <UTextarea
                  v-model="pathsText"
                  :rows="6"
                  class="w-full font-mono"
                  placeholder="module-definitions/fiber-tickets.json&#10;module-definitions/devices.xml"
                />
              </UFormField>

              <div class="space-y-4">
                <UFormField label="Force" name="force">
                  <USwitch v-model="force" />
                </UFormField>

                <UButton
                  block
                  icon="i-lucide-play"
                  :loading="loading"
                  @click="dryRunPlan"
                >
                  Dry-run plan
                </UButton>
              </div>
            </div>

            <UContextMenu :items="fileContextItems(activeFile)">
              <AppDataTable
                :data="planFiles"
                :columns="fileColumns"
                @row-contextmenu="onFileRowContext"
                @row-click="onFileRowContext"
              />
            </UContextMenu>
          </div>

          <USlideover v-model:open="previewOpen" :title="previewFile?.path || 'Podglad'">
            <template #body>
              <pre class="overflow-auto rounded-lg bg-muted p-4 text-xs"><code>{{ previewFile?.content }}</code></pre>
            </template>
          </USlideover>
        </template>

        <template #validation>
          <div class="space-y-4">
            <UAlert
              v-if="validation"
              :color="validation.success ? 'success' : 'error'"
              variant="soft"
              :title="validation.success ? 'Walidacja OK' : 'Walidacja FAIL'"
              :description="validation.phase"
            />

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="Brak walidacji"
              description="Wygeneruj dry-run plan, zeby zobaczyc raport."
            />

            <div v-if="validation?.errors.length" class="space-y-2">
              <h3 class="font-medium">
                Bledy
              </h3>

              <ul class="list-disc space-y-1 pl-5 text-sm text-error">
                <li v-for="error in validation.errors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>

            <div v-if="validation?.warnings.length" class="space-y-2">
              <h3 class="font-medium">
                Ostrzezenia
              </h3>

              <ul class="list-disc space-y-1 pl-5 text-sm text-warning">
                <li v-for="warning in validation.warnings" :key="warning">
                  {{ warning }}
                </li>
              </ul>
            </div>
          </div>
        </template>
      </UTabs>
    </template>
  </UDashboardPanel>
</template>

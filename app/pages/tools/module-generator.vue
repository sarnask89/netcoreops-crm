<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import type { UIMessage } from 'ai'

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

interface ChatSuggestion {
  id: string
  title: string
  reason: string
  category: 'module' | 'route' | 'integration' | 'dictionary' | 'automation'
}

const toast = useToast()

const tabs = [
  {
    label: 'Chat HITL',
    icon: 'i-lucide-message-square',
    slot: 'chat'
  },
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
const aiPrompt = ref('Modul GPON SLA dla NMS: status SLA, RX power dBm, snapshot diagnostyczny JSON, priorytet, wlaczony monitoring i data ostatniego sprawdzenia.')
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
const chatInput = ref('')
const chatLoading = ref(false)
const chatModel = ref('netcoreops-module-coder')
const chatModelOptions = ref<Array<{ label: string, value: string }>>([
  { label: 'netcoreops-module-coder', value: 'netcoreops-module-coder' }
])
const chatReadyForPlan = ref(false)
const chatDefinition = ref<ModuleDefinition | null>(null)
const chatSuggestions = ref<ChatSuggestion[]>([])
const selectedSuggestionIds = ref<string[]>([])
const chatMessages = ref<UIMessage[]>([
  {
    id: 'intro',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Opisz modul, ktory chcesz utworzyc. Poprowadze pytaniami i zaproponuje powiazane elementy.'
      }
    ]
  }
])
const chatDefinitionJson = computed(() => chatDefinition.value ? JSON.stringify(chatDefinition.value, null, 2) : '')

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

async function draftSpec(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<{ success: true, data: ModuleDefinition }>('/api/module-generator/draft', {
      method: 'POST',
      body: {
        prompt: aiPrompt.value
      }
    })

    parsedDefinition.value = response.data
    specFormat.value = 'json'
    specInput.value = JSON.stringify(response.data, null, 2)

    toast.add({
      title: 'Spec wygenerowany',
      description: response.data.module,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Blad AI draft',
      description: error instanceof Error ? error.message : 'Nie udalo sie wygenerowac spec',
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

function toggleSuggestion(id: string, enabled: boolean | 'indeterminate'): void {
  if (enabled === 'indeterminate') {
    return
  }

  if (enabled) {
    if (!selectedSuggestionIds.value.includes(id)) {
      selectedSuggestionIds.value = [...selectedSuggestionIds.value, id]
    }

    return
  }

  selectedSuggestionIds.value = selectedSuggestionIds.value.filter(value => value !== id)
}

async function sendChatPrompt(): Promise<void> {
  const message = chatInput.value.trim()
  if (!message || chatLoading.value) return

  chatMessages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    parts: [{ type: 'text', text: message }]
  })
  chatInput.value = ''
  chatLoading.value = true

  try {
    const response = await $fetch<{
      success: true
      data: {
        assistantMessage: string
        nextQuestion: string | null
        readyForPlan: boolean
        suggestions: ChatSuggestion[]
        definition: ModuleDefinition | null
      }
    }>('/api/module-generator/chat', {
      method: 'POST',
      body: {
        message,
        model: chatModel.value,
        conversation: chatMessages.value.map(item => ({
          role: item.role,
          text: item.parts
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .join('\n')
        })),
        selectedSuggestions: chatSuggestions.value
          .filter(item => selectedSuggestionIds.value.includes(item.id))
          .map(item => ({ id: item.id, title: item.title, category: item.category })),
        currentDefinition: chatDefinition.value
      }
    })

    chatMessages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: response.data.nextQuestion
            ? `${response.data.assistantMessage}\n\nPytanie: ${response.data.nextQuestion}`
            : response.data.assistantMessage
        }
      ]
    })

    chatSuggestions.value = response.data.suggestions
    selectedSuggestionIds.value = selectedSuggestionIds.value.filter(id => chatSuggestions.value.some(item => item.id === id))
    chatReadyForPlan.value = response.data.readyForPlan
    chatDefinition.value = response.data.definition
  } catch (error) {
    toast.add({
      title: 'Blad chat',
      description: error instanceof Error ? error.message : 'Nie udalo sie przetworzyc zapytania',
      color: 'error'
    })
  } finally {
    chatLoading.value = false
  }
}

async function loadChatModels(): Promise<void> {
  try {
    const response = await $fetch<{ success: true, data: string[] }>('/api/module-generator/ollama-models')
    if (!response.data.length) return

    chatModelOptions.value = response.data.map(name => ({ label: name, value: name }))
    const preferred = response.data.find(name => name === 'deepseek-r1')
      || response.data.find(name => name.startsWith('qwen3'))
      || response.data.find(name => name === 'netcoreops-module-coder')
      || response.data[0]

    if (preferred) {
      chatModel.value = preferred
    }
  } catch {
    // keep default model silently
  }
}

function applyChatDraftToSpec(): void {
  if (!chatDefinition.value) return
  parsedDefinition.value = chatDefinition.value
  specFormat.value = 'json'
  specInput.value = JSON.stringify(chatDefinition.value, null, 2)

  toast.add({
    title: 'Draft przeniesiony',
    description: 'Masz gotowy draft. Potwierdz dalej w Plan.',
    color: 'success'
  })
}

onMounted(() => {
  loadChatModels()
})
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
        <template #chat>
          <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div class="space-y-3">
              <UChatMessages
                :messages="chatMessages"
                :status="chatLoading ? 'streaming' : 'ready'"
                class="h-[520px] overflow-y-auto rounded-lg border border-default p-3"
              />

              <UChatPrompt
                v-model="chatInput"
                :loading="chatLoading"
                placeholder="Np. Modul CRM do przypomnien, umow i automatyzacji..."
                @submit.prevent="sendChatPrompt"
              />
            </div>

            <div class="space-y-4">
              <UFormField label="Model Ollama" name="chatModel">
                <USelect
                  v-model="chatModel"
                  :items="chatModelOptions"
                  class="w-full"
                />
              </UFormField>

              <UAlert
                color="neutral"
                variant="soft"
                title="Propozycje rozszerzen"
                description="Zaznacz, co uwzglednic. Potem wyslij wiadomosc np. 'uwzglednij zaznaczone propozycje'."
              />

              <div class="space-y-3 rounded-lg border border-default p-3">
                <div
                  v-for="item in chatSuggestions"
                  :key="item.id"
                  class="space-y-1 rounded-md border border-default p-2"
                >
                  <UCheckbox
                    :model-value="selectedSuggestionIds.includes(item.id)"
                    :label="item.title"
                    @update:model-value="(value) => toggleSuggestion(item.id, value)"
                  />
                  <div class="text-xs text-muted">
                    {{ item.category }} • {{ item.reason }}
                  </div>
                </div>
              </div>

              <div v-if="chatDefinition" class="space-y-3 rounded-lg border border-default p-3">
                <div class="text-sm font-medium">
                  Draft do zatwierdzenia
                </div>
                <div class="text-xs text-muted">
                  {{ chatDefinition.module }} | {{ chatDefinition.tableName }} | {{ chatDefinition.route }} | pola: {{ chatDefinition.fields.length }}
                </div>
                <UTextarea
                  :model-value="chatDefinitionJson"
                  :rows="14"
                  readonly
                  class="w-full font-mono text-xs"
                />
              </div>

              <UButton
                block
                icon="i-lucide-check-check"
                :disabled="!chatReadyForPlan || !chatDefinition"
                @click="applyChatDraftToSpec"
              >
                Ready plan: potwierdz draft
              </UButton>
            </div>
          </div>
        </template>

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
              <UFormField label="AI request" name="aiPrompt">
                <UTextarea
                  v-model="aiPrompt"
                  :rows="5"
                  class="w-full"
                  placeholder="Opisz modul, pola i ekran"
                />
              </UFormField>

              <UButton
                block
                icon="i-lucide-sparkles"
                :loading="loading"
                @click="draftSpec"
              >
                AI draft
              </UButton>

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

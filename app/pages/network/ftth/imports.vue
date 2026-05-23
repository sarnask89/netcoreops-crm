<script setup lang="ts">
interface EquipmentOption {
  id: string
  inventoryId: string
  hostname?: string | null
  managementIp?: string | null
  managementProtocol?: string | null
  managementDriver?: { code: string, label?: string } | null
}

interface OptionsResponse {
  success: boolean
  data: { equipment: EquipmentOption[] }
}

interface ImportProgress {
  activeOnly?: boolean
  totalKnownOnus?: number
  selectedOnus?: number
  processedOnus?: number
  rangeFrom?: number
  rangeTo?: number
  ipHosts?: number
  macRows?: number
  completed?: boolean
  currentOnu?: string | null
}

interface ImportResponse {
  success: boolean
  data: {
    mode: string
    counts?: Record<string, number>
    sampleActions?: Array<Record<string, unknown>>
    progress?: ImportProgress
  }
}

interface ImportJob {
  id: string
  kind: 'ip-hosts' | 'mac-map'
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: ImportProgress
  result?: ImportResponse['data']
  error?: string
}

interface ImportJobResponse {
  success: boolean
  data: ImportJob
}

const toast = useToast()
const equipmentId = ref<string>()
const mode = ref<'preview' | 'apply'>('apply')
const activeOnly = ref(true)
const rangeFrom = ref(1)
const rangeTo = ref(50)
const loading = ref('')
const result = ref<ImportResponse | null>(null)
const plannedProgress = ref<ImportProgress | null>(null)
const job = ref<ImportJob | null>(null)
let progressTimer: ReturnType<typeof setInterval> | null = null

const { data: options } = await useFetch<OptionsResponse>('/api/network/import-options', {
  default: () => ({ success: false, data: { equipment: [] } })
})
const { data: onus, refresh: refreshOnus } = await useFetch<{ success: boolean, data: Array<{ status: string, oltInventoryId: string, ponPortCode: string, onuIdentifier: string }> }>('/api/ftth/imports/options', {
  default: () => ({ success: false, data: [] })
})

const dasanEquipment = computed(() => options.value.data.equipment.filter(item => item.managementDriver?.code === 'dasan_nos'))
const equipmentItems = computed(() => dasanEquipment.value.map(item => ({
  label: [item.inventoryId, item.hostname, item.managementIp].filter(Boolean).join(' - '),
  value: item.id
})))
const selectedEquipment = computed(() => dasanEquipment.value.find(item => item.id === equipmentId.value))
function numericPart(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

const selectedOltOnus = computed(() => selectedEquipment.value
  ? [...onus.value.data.filter(onu => onu.oltInventoryId === selectedEquipment.value?.inventoryId)].sort((left, right) => {
      const portDiff = numericPart(left.ponPortCode) - numericPart(right.ponPortCode)
      if (portDiff) return portDiff
      const onuDiff = numericPart(left.onuIdentifier) - numericPart(right.onuIdentifier)
      if (onuDiff) return onuDiff
      return `${left.ponPortCode}:${left.onuIdentifier}`.localeCompare(`${right.ponPortCode}:${right.onuIdentifier}`)
    })
  : [])
const scopedOnus = computed(() => activeOnly.value
  ? selectedOltOnus.value.filter(onu => onu.status?.toLowerCase() === 'active')
  : selectedOltOnus.value)
const totalOnuCount = computed(() => selectedOltOnus.value.length)
const rangeStartIndex = computed(() => Math.max(rangeFrom.value - 1, 0))
const rangeEndIndex = computed(() => Math.max(rangeTo.value, rangeStartIndex.value))
const selectedCount = computed(() => scopedOnus.value.slice(rangeStartIndex.value, rangeEndIndex.value).length)
const currentProgress = computed(() => result.value?.data.progress || job.value?.progress || plannedProgress.value)
const progressValue = computed(() => {
  const progress = currentProgress.value
  if (progress?.completed) return 100
  if (!progress?.selectedOnus) return 0
  return Math.round(((progress.processedOnus || 0) / progress.selectedOnus) * 100)
})

watch(equipmentId, () => {
  stopProgressPolling()
  result.value = null
  plannedProgress.value = null
  job.value = null
})

watch(rangeFrom, (value) => {
  if (rangeTo.value < value) rangeTo.value = value
})

onBeforeUnmount(() => stopProgressPolling())

function stopProgressPolling() {
  if (!progressTimer) return
  clearInterval(progressTimer)
  progressTimer = null
}

async function pollImportJob(jobId: string) {
  const response = await $fetch<ImportJobResponse>(`/api/ftth/imports/jobs/${jobId}`)
  job.value = response.data

  if (response.data.status === 'completed' && response.data.result) {
    stopProgressPolling()
    result.value = { success: true, data: response.data.result }
    plannedProgress.value = response.data.progress
    loading.value = ''
    await refreshOnus()
    return
  }

  if (response.data.status === 'failed') {
    stopProgressPolling()
    loading.value = ''
    toast.add({ title: 'Import FTTH nie powiódł się', description: response.data.error || 'Nieznany błąd importu', color: 'error' })
  }
}

async function runImportJob(kind: 'ip-hosts' | 'mac-map') {
  const response = await $fetch<ImportJobResponse>(`/api/ftth/imports/dasan/${equipmentId.value}/jobs`, {
    method: 'POST',
    body: {
      kind,
      mode: mode.value,
      activeOnly: activeOnly.value,
      rangeFrom: rangeFrom.value,
      rangeTo: rangeTo.value
    }
  })

  job.value = response.data
  await pollImportJob(response.data.id)
  if (!['completed', 'failed'].includes(job.value?.status || '')) {
    progressTimer = setInterval(() => {
      void pollImportJob(response.data.id).catch((error) => {
        stopProgressPolling()
        loading.value = ''
        toast.add({ title: 'Nie można odczytać postępu importu', description: error instanceof Error ? error.message : String(error), color: 'error' })
      })
    }, 1000)
  }
}

async function runImport(kind: 'onus' | 'ip-hosts' | 'mac-map') {
  if (!equipmentId.value) return
  stopProgressPolling()
  loading.value = kind
  result.value = null
  job.value = null
  plannedProgress.value = {
    activeOnly: activeOnly.value,
    totalKnownOnus: totalOnuCount.value,
    selectedOnus: kind === 'onus' ? undefined : selectedCount.value,
    processedOnus: 0,
    rangeFrom: rangeFrom.value,
    rangeTo: rangeTo.value,
    completed: false
  }

  let asyncJobStarted = false
  try {
    if (kind === 'ip-hosts' || kind === 'mac-map') {
      asyncJobStarted = true
      await runImportJob(kind)
      return
    }

    result.value = await $fetch<ImportResponse>(`/api/ftth/imports/dasan/${equipmentId.value}/${kind}`, {
      method: 'POST',
      body: {
        mode: mode.value,
        activeOnly: activeOnly.value,
        rangeFrom: rangeFrom.value,
        rangeTo: rangeTo.value
      }
    })
    plannedProgress.value = result.value.data.progress || null
    await refreshOnus()
  } catch (error) {
    toast.add({ title: 'Import FTTH nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    if (!asyncJobStarted) loading.value = ''
  }
}
</script>

<template>
  <UDashboardPanel id="network-ftth-imports" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH importy">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <USelect
              v-model="equipmentId"
              :items="equipmentItems"
              placeholder="Wybierz Dasan OLT"
              class="w-full min-w-0 sm:w-96"
            />
            <USelect v-model="mode" :items="['preview', 'apply']" class="w-32" />
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[360px_1fr]">
        <div class="space-y-4 border-r border-default p-4 sm:p-6">
          <div class="space-y-3 border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              Zakres mapowania
            </div>
            <UCheckbox v-model="activeOnly" label="Tylko aktywne ONU" />
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Od pozycji">
                <UInputNumber
                  v-model="rangeFrom"
                  :min="1"
                  :max="10000"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Do pozycji">
                <UInputNumber
                  v-model="rangeTo"
                  :min="rangeFrom"
                  :max="10000"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="text-xs text-muted">
              Wybrane do mapowania: {{ selectedCount }} / {{ scopedOnus.length }} ONU
            </div>
          </div>

          <div class="space-y-3 border border-default p-4">
            <UButton
              block
              label="Importuj listę ONU"
              icon="i-lucide-git-branch"
              :loading="loading === 'onus'"
              @click="runImport('onus')"
            />
            <UButton
              block
              :label="activeOnly ? 'Importuj IP-host aktywnych ONU' : 'Importuj IP-host ONU'"
              icon="i-lucide-router"
              variant="subtle"
              :loading="loading === 'ip-hosts'"
              @click="runImport('ip-hosts')"
            />
            <UButton
              block
              :label="activeOnly ? 'Mapuj MAC aktywnych ONU' : 'Mapuj MAC ONU'"
              icon="i-lucide-list-tree"
              variant="subtle"
              :loading="loading === 'mac-map'"
              @click="runImport('mac-map')"
            />
          </div>
        </div>

        <div class="min-w-0 space-y-4 p-4 sm:p-6">
          <div v-if="loading || currentProgress" class="space-y-3 border border-default p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-highlighted">
                Postęp importu
              </div>
              <div class="flex items-center gap-2">
                <UBadge v-if="job?.status" color="neutral" variant="subtle">
                  {{ job.status }}
                </UBadge>
                <UBadge color="neutral" variant="subtle">
                  {{ progressValue }}%
                </UBadge>
              </div>
            </div>
            <UProgress :model-value="progressValue" />
            <div class="grid gap-2 text-sm text-muted md:grid-cols-2">
              <div>ONU razem: {{ currentProgress?.totalKnownOnus ?? totalOnuCount }}</div>
              <div>ONU w zakresie: {{ currentProgress?.selectedOnus ?? selectedCount }}</div>
              <div>Zakres: {{ currentProgress?.rangeFrom ?? rangeFrom }}-{{ currentProgress?.rangeTo ?? rangeTo }}</div>
              <div>Przetworzone ONU: {{ currentProgress?.processedOnus ?? 0 }}</div>
              <div>Aktywne tylko: {{ currentProgress?.activeOnly ? 'tak' : 'nie' }}</div>
              <div v-if="currentProgress?.currentOnu">
                Aktualne ONU: {{ currentProgress.currentOnu }}
              </div>
              <div v-if="currentProgress?.ipHosts !== undefined">
                IP-host: {{ currentProgress.ipHosts }}
              </div>
              <div v-if="currentProgress?.macRows !== undefined">
                MAC rows: {{ currentProgress.macRows }}
              </div>
            </div>
          </div>
          <AppDiagnosticResult :result="result" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

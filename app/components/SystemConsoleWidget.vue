<script setup lang="ts">
interface ConsoleEvent {
  id: string
  type: 'database' | 'error'
  severity: 'info' | 'error'
  message: string
  detail?: string
  createdAt: string
}

const enabled = ref(false)
const open = ref(false)
const events = ref<ConsoleEvent[]>([])
let timer: ReturnType<typeof setInterval> | undefined

function onConsoleSettingChanged() {
  readSetting()
  if (enabled.value) loadEvents()
}

async function loadEvents() {
  if (!enabled.value) return
  try {
    const response = await $fetch<{ success: boolean, data: ConsoleEvent[] }>('/api/system/console/events', {
      query: { limit: 100 }
    })
    events.value = response.data
  } catch {
    events.value = []
  }
}

function readSetting() {
  enabled.value = localStorage.getItem('netcoreops-console-enabled') === 'true'
}

function onStorage(event: StorageEvent) {
  if (event.key !== 'netcoreops-console-enabled') return
  readSetting()
  if (enabled.value) loadEvents()
}

onMounted(() => {
  readSetting()
  if (enabled.value) loadEvents()
  timer = setInterval(loadEvents, 5000)
  window.addEventListener('storage', onStorage)
  window.addEventListener('netcoreops-console-setting-changed', onConsoleSettingChanged)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('netcoreops-console-setting-changed', onConsoleSettingChanged)
})

const latestEvents = computed(() => events.value.slice(0, 50))
const errorCount = computed(() => events.value.filter(event => event.type === 'error').length)

function formatDate(value: string) {
  return new Date(value).toLocaleTimeString('pl-PL')
}
</script>

<template>
  <ClientOnly>
    <div v-if="enabled" class="fixed bottom-5 right-5 z-50">
      <UButton
        color="neutral"
        variant="solid"
        icon="i-lucide-terminal"
        :label="errorCount ? `Konsola (${errorCount})` : 'Konsola'"
        class="shadow-xl ring-1 ring-default/70 backdrop-blur"
        @click="open = true"
      />
    </div>

    <USlideover v-model:open="open" title="Konsola systemowa" description="Zmiany w bazie danych i błędy API/runtime.">
      <template #body>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm text-muted">
              Ostatnie {{ latestEvents.length }} zdarzeń
            </p>
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-refresh-cw"
              label="Odśwież"
              @click="loadEvents"
            />
          </div>

          <UAlert
            v-if="latestEvents.length === 0"
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            title="Brak zdarzeń"
            description="Konsola pokaże tutaj zmiany SQL oraz błędy przechwycone przez backend."
          />

          <div v-for="event in latestEvents" :key="event.id" class="rounded-lg border border-default bg-muted/30 p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <UBadge :color="event.type === 'error' ? 'error' : 'info'" variant="soft">
                  {{ event.type === 'error' ? 'Błąd' : 'DB' }}
                </UBadge>
                <span class="font-medium text-sm">{{ event.message }}</span>
              </div>
              <span class="text-xs text-muted whitespace-nowrap">{{ formatDate(event.createdAt) }}</span>
            </div>
            <pre v-if="event.detail" class="mt-2 max-h-36 overflow-auto whitespace-pre-wrap rounded bg-default/60 p-2 text-xs">{{ event.detail }}</pre>
          </div>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>

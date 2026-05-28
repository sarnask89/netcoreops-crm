<script setup lang="ts">
interface SyslogRow {
  id: string
  facility: number | null
  severity: number | null
  timestamp: string | null
  hostname: string | null
  appName: string | null
  message: string
  receivedAt: string
}

const toast = useToast()
const syslog = ref<SyslogRow[]>([])
const loading = ref(true)
const hostnameFilter = ref('')
const severityFilter = ref('')

const syslogSeverities = [
  { label: 'Emergency', value: '0', color: 'error' },
  { label: 'Alert', value: '1', color: 'error' },
  { label: 'Critical', value: '2', color: 'error' },
  { label: 'Error', value: '3', color: 'error' },
  { label: 'Warning', value: '4', color: 'warning' },
  { label: 'Notice', value: '5', color: 'info' },
  { label: 'Info', value: '6', color: 'neutral' },
  { label: 'Debug', value: '7', color: 'neutral' }
]

async function load() {
  loading.value = true
  try {
    const query: Record<string, string> = {}
    if (hostnameFilter.value) query.hostname = hostnameFilter.value
    if (severityFilter.value) query.severity = severityFilter.value
    const res = await $fetch<{ success: boolean, data: SyslogRow[] }>('/api/system/syslog', { query })
    syslog.value = res.data
  } catch {
    toast.add({ title: 'Błąd ładowania syslog', color: 'error' })
  } finally {
    loading.value = false
  }
}

watch([hostnameFilter, severityFilter], load)
onMounted(load)

function severityLabel(severity: number | null) {
  if (severity === null) return '?'
  return syslogSeverities[severity]?.label || String(severity)
}

function severityColor(severity: number | null) {
  if (severity === null) return 'neutral' as const
  return (syslogSeverities[severity]?.color || 'neutral') as 'error' | 'warning' | 'success' | 'info' | 'neutral'
}
</script>

<template>
  <UDashboardPanel id="syslog" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Syslog / dziennik zdarzeń">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Odśwież" icon="i-lucide-refresh-cw" variant="subtle" @click="load" />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput v-model="hostnameFilter" placeholder="Filtruj po hostname..." class="min-w-48" />
          <USelect
            v-model="severityFilter"
            :items="[{ label: 'Wszystkie', value: '' }, ...syslogSeverities.map(s => ({ label: s.label, value: s.value }))]"
            class="min-w-36"
          />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span i-lucide-loader-circle animate-spin class="size-6 text-muted" />
      </div>
      <div v-else-if="!syslog.length" class="flex flex-col items-center justify-center py-20 text-muted">
        <span i-lucide-log-in class="size-8 mb-2" />
        <p>Brak wpisów syslog</p>
        <p class="text-xs mt-1">Skonfiguruj przekazywanie syslog z urządzeń na adres tego serwera</p>
      </div>
      <UTable v-else :data="syslog" class="w-full">
        <template #columns>
          <UTableColumn header="Odebrano" accessor-key="receivedAt" class="w-36">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ new Date(row.receivedAt).toLocaleString('pl-PL') }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="Czas" accessor-key="timestamp" class="w-36">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ row.timestamp ? new Date(row.timestamp).toLocaleString('pl-PL') : '-' }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="Priorytet" accessor-key="severity" class="w-24">
            <template #default="{ row }">
              <UBadge :color="severityColor(row.severity)" variant="subtle" size="sm">{{ severityLabel(row.severity) }}</UBadge>
            </template>
          </UTableColumn>
          <UTableColumn header="Host" accessor-key="hostname" class="w-32" />
          <UTableColumn header="Aplikacja" accessor-key="appName" class="w-24" />
          <UTableColumn header="Treść" accessor-key="message">
            <template #default="{ row }">
              <span class="text-xs font-mono break-all line-clamp-2">{{ row.message }}</span>
            </template>
          </UTableColumn>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>

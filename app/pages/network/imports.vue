<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

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
  data: {
    equipment: EquipmentOption[]
  }
}

interface NetworkOption {
  cidr: string
  gateway?: string | null
  comment?: string | null
}

interface LeaseRow {
  id?: string
  address?: string
  macAddress?: string
  comment?: string
  rateLimit?: string
  status?: string
  disabled?: boolean
  blocked?: boolean
  server?: string
  interface?: string
}

interface ImportPreviewRow {
  action: string
  entity: string
  key: string
  label: string
  customer: string
  commentAddress: string
  dictionaryAddress: string
  ipAddress: string
  macAddress: string
  tariff: string
  issues: string[]
  reason?: string
}

const toast = useToast()
const equipmentId = ref<string>()
const mode = ref<'preview' | 'apply'>('preview')
const importFilter = ref<'all' | 'issues' | 'ready' | 'conflicts'>('all')
const result = ref<unknown>(null)
const loading = ref('')
const macAddress = ref('')
const selectedNetworks = ref<string[]>([])
const ipAddress = ref('')
const oltPort = ref('1')
const onuId = ref('')
const leases = ref<LeaseRow[]>([])
const leaseTotal = ref(0)
const selectedLease = ref<LeaseRow | null>(null)
const leaseDetailsOpen = ref(false)
const { data: options, refresh: refreshOptions } = await useFetch<OptionsResponse>('/api/network/import-options', {
  default: () => ({ success: false, data: { equipment: [] } })
})

watch(equipmentId, () => {
  selectedNetworks.value = []
  leases.value = []
  leaseTotal.value = 0
  result.value = null
})

const selectedEquipment = computed(() => options.value.data.equipment.find(item => item.id === equipmentId.value))
const selectedDriver = computed(() => selectedEquipment.value?.managementDriver?.code || selectedEquipment.value?.managementProtocol || '')
const isMikrotikDevice = computed(() => {
  const equipment = selectedEquipment.value
  const driverCode = equipment?.managementDriver?.code?.toLowerCase() || ''
  const protocol = equipment?.managementProtocol?.toLowerCase() || ''
  const inventoryId = equipment?.inventoryId?.toLowerCase() || ''
  const hostname = equipment?.hostname?.toLowerCase() || ''

  return driverCode === 'mikrotik_v7'
    || protocol === 'routeros'
    || inventoryId.startsWith('mt-')
    || hostname.includes('mikrotik')
})
const isDasanDevice = computed(() => selectedEquipment.value?.managementDriver?.code === 'dasan_nos')
const equipmentItems = computed(() => options.value.data.equipment.map(item => ({
  label: [item.inventoryId, item.managementIp, item.managementDriver?.code || item.managementProtocol].filter(Boolean).join(' - '),
  value: item.id
})))
const leaseColumns: TableColumn<LeaseRow>[] = [
  { accessorKey: 'address', header: 'IP' },
  { accessorKey: 'macAddress', header: 'MAC' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'disabled', header: 'Disabled' },
  { accessorKey: 'blocked', header: 'Blocked' },
  { accessorKey: 'server', header: 'DHCP' },
  { accessorKey: 'interface', header: 'Interfejs' },
  { accessorKey: 'rateLimit', header: 'Rate limit' },
  { accessorKey: 'comment', header: 'Komentarz' }
]
const importFilterItems = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Tylko z brakami', value: 'issues' },
  { label: 'Gotowe do zapisu', value: 'ready' },
  { label: 'Konflikty MAC/klient', value: 'conflicts' }
]
const importColumns: TableColumn<ImportPreviewRow>[] = [
  { accessorKey: 'customer', header: 'Klient' },
  { accessorKey: 'commentAddress', header: 'Adres z komentarza' },
  { accessorKey: 'dictionaryAddress', header: 'Adres slownikowy' },
  { accessorKey: 'ipAddress', header: 'IP' },
  { accessorKey: 'macAddress', header: 'MAC' },
  { accessorKey: 'tariff', header: 'Taryfa' },
  {
    id: 'issues',
    header: 'Braki',
    cell: ({ row }) => row.original.issues.length ? row.original.issues.join(', ') : 'Brak'
  }
]

function getImportActions() {
  const value = result.value as { data?: { sampleActions?: Array<Record<string, unknown>> } } | null
  return value?.data?.sampleActions || []
}

const importedNetworks = computed<NetworkOption[]>(() => {
  const value = result.value as { data?: { networks?: NetworkOption[] } } | null
  return value?.data?.networks || []
})

const importRows = computed<ImportPreviewRow[]>(() => getImportActions().map((action) => {
  const data = (action.data || {}) as Record<string, unknown>
  const lease = (data.lease || {}) as Partial<LeaseRow>
  const enriched = (data.enriched || {}) as Record<string, unknown>
  const parsed = (data.parsed || {}) as Record<string, string | null | undefined>
  const issues = Array.isArray(enriched.issues) ? enriched.issues : []

  return {
    action: String(action.action || ''),
    entity: String(action.entity || ''),
    key: String(action.key || ''),
    label: String(action.label || ''),
    customer: String(enriched.customerName || 'Brak'),
    commentAddress: [parsed.streetName, parsed.streetNumber, parsed.apartmentNumber ? `/${parsed.apartmentNumber}` : ''].filter(Boolean).join('') || lease.comment || 'Brak',
    dictionaryAddress: String(enriched.displayAddress || 'Brak dopasowania'),
    ipAddress: lease.address || '',
    macAddress: lease.macAddress || String(action.key || ''),
    tariff: String(enriched.tariffName || lease.rateLimit || 'Brak'),
    issues: issues.map(String),
    reason: typeof action.reason === 'string' ? action.reason : undefined
  }
}))

const filteredImportRows = computed(() => {
  if (importFilter.value === 'issues') return importRows.value.filter(row => row.issues.length > 0)
  if (importFilter.value === 'ready') return importRows.value.filter(row => row.issues.length === 0 && row.action !== 'conflict')
  if (importFilter.value === 'conflicts') return importRows.value.filter(row => row.action === 'conflict' || row.issues.some(issue => issue.toLowerCase().includes('konflikt')))
  return importRows.value
})

function showLeaseDetails(row: LeaseRow) {
  selectedLease.value = row
  leaseDetailsOpen.value = true
}

function leaseContextItems(row: LeaseRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły dzierżawy', icon: 'i-lucide-panel-right-open', onSelect: () => showLeaseDetails(row) },
    { label: 'Użyj MAC w teście', icon: 'i-lucide-network', onSelect: () => { macAddress.value = row.macAddress || '' } },
    { label: 'Użyj IP w teście', icon: 'i-lucide-radar', onSelect: () => { ipAddress.value = row.address || '' } }
  ], [
    { label: 'Odśwież DHCP leases', icon: 'i-lucide-refresh-cw', onSelect: () => loadDhcpLeases() }
  ]]
}

function endpoint(kind: string) {
  if (!equipmentId.value) return ''
  const scopedKind = kind.replace('/', `/${equipmentId.value}/`)
  if (kind.startsWith('dasan/')) return `/api/ftth/imports/${scopedKind}`
  return `/api/import/${scopedKind}`
}

function selectAllNetworks() {
  selectedNetworks.value = importedNetworks.value.map(network => network.cidr)
}

function clearSelectedNetworks() {
  selectedNetworks.value = []
}

async function runImport(kind: 'mikrotik/leases' | 'mikrotik/networks' | 'mikrotik/config' | 'dasan/onus' | 'dasan/ip-hosts' | 'dasan/mac-map') {
  if (!equipmentId.value) return
  if (kind === 'mikrotik/leases' && importedNetworks.value.length && !selectedNetworks.value.length) {
    toast.add({ title: 'Wybierz co najmniej jedną sieć DHCP', color: 'warning' })
    return
  }

  loading.value = kind
  try {
    const body: Record<string, unknown> = { mode: mode.value }
    if (kind === 'mikrotik/leases') body.selectedNetworks = selectedNetworks.value
    const response = await $fetch(endpoint(kind), {
      method: 'POST',
      body
    })
    result.value = response
    if (kind === 'mikrotik/networks') {
      selectedNetworks.value = importedNetworks.value.map(network => network.cidr)
    }
    if (mode.value === 'apply') await refreshOptions()
  } catch (error) {
    toast.add({ title: 'Import nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function loadDhcpLeases() {
  if (!equipmentId.value) return
  loading.value = 'dhcp-leases'
  try {
    const response = await $fetch<{ success: boolean, data: { total: number, leases: LeaseRow[] } }>(`/api/diagnostics/equipment/${equipmentId.value}/dhcp-leases`, {
      query: { limit: 300 }
    })
    leases.value = response.data.leases
    leaseTotal.value = response.data.total
    result.value = response
  } catch (error) {
    toast.add({ title: 'DHCP leases nie działają', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runMikrotikCheck() {
  if (!equipmentId.value) return
  loading.value = 'mikrotik-check'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/mikrotik-check`, {
      method: 'POST',
      body: {
        macAddress: macAddress.value || null,
        ipAddress: ipAddress.value || null
      }
    })
  } catch (error) {
    toast.add({ title: 'Test MikroTik nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runMacCheck() {
  if (!equipmentId.value || !macAddress.value) return
  loading.value = 'mac-check'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/mac-check`, {
      method: 'POST',
      body: { macAddress: macAddress.value }
    })
  } catch (error) {
    toast.add({ title: 'MAC lookup nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runCommandTree() {
  if (!equipmentId.value) return
  loading.value = 'command-tree'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/command-tree`, { method: 'POST' })
  } catch (error) {
    toast.add({ title: 'Command tree nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runOnuIpHost() {
  if (!equipmentId.value || !oltPort.value || !onuId.value) return
  loading.value = 'onu-ip-host'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/onu-ip-host`, {
      method: 'POST',
      body: {
        oltPort: oltPort.value,
        onuId: onuId.value
      }
    })
  } catch (error) {
    toast.add({ title: 'ONU IP-host nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}
</script>

<template>
  <UDashboardPanel id="network-imports" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Importy i diagnostyka live">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <USelect
            v-model="equipmentId"
            :items="equipmentItems"
            value-key="value"
            label-key="label"
            placeholder="Wybierz urządzenie"
            class="min-w-96"
          />
          <USelect v-model="mode" :items="['preview', 'apply']" class="min-w-32" />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[380px_1fr]">
        <div class="space-y-4 border-r border-default p-4 sm:p-6">
          <div class="border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              {{ selectedEquipment?.inventoryId || 'Brak urządzenia' }}
            </div>
            <div class="mt-1 text-sm text-muted">
              {{ selectedEquipment?.managementIp || 'bez IP' }} / {{ selectedDriver || 'bez drivera' }}
            </div>
          </div>

          <div v-if="isMikrotikDevice" class="space-y-3 border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              MikroTik RouterOS
            </div>
            <UButton
              block
              label="Pokaż DHCP leases"
              icon="i-lucide-list"
              :loading="loading === 'dhcp-leases'"
              @click="loadDhcpLeases"
            />
            <UButton
              block
              label="Importuj DHCP leases"
              icon="i-lucide-database-zap"
              variant="subtle"
              :loading="loading === 'mikrotik/leases'"
              @click="runImport('mikrotik/leases')"
            />
            <UButton
              block
              label="Importuj DHCP networks"
              icon="i-lucide-network"
              variant="subtle"
              :loading="loading === 'mikrotik/networks'"
              @click="runImport('mikrotik/networks')"
            />
            <div v-if="importedNetworks.length" class="space-y-3 border border-default p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-highlighted">
                    Wybór sieci DHCP
                  </div>
                  <div class="text-xs text-muted">
                    {{ selectedNetworks.length }} / {{ importedNetworks.length }} zaznaczonych
                  </div>
                </div>
                <div class="flex gap-2">
                  <UButton
                    size="xs"
                    icon="i-lucide-check-check"
                    variant="subtle"
                    label="Wszystkie"
                    @click="selectAllNetworks"
                  />
                  <UButton
                    size="xs"
                    icon="i-lucide-square"
                    variant="subtle"
                    label="Wyczyść"
                    @click="clearSelectedNetworks"
                  />
                </div>
              </div>
              <div class="max-h-64 space-y-2 overflow-auto pr-1">
                <label
                  v-for="network in importedNetworks"
                  :key="network.cidr"
                  class="flex cursor-pointer items-start gap-3 border border-default px-3 py-2 text-sm"
                >
                  <input
                    v-model="selectedNetworks"
                    type="checkbox"
                    :value="network.cidr"
                    class="mt-1 h-4 w-4 rounded border-default text-primary"
                  >
                  <span class="min-w-0">
                    <span class="block font-medium text-highlighted">{{ network.cidr }}</span>
                    <span class="block text-xs text-muted">
                      {{ network.comment || network.gateway || 'Brak opisu' }}
                    </span>
                  </span>
                </label>
              </div>
            </div>
            <div class="grid gap-2">
              <UInput v-model="macAddress" placeholder="MAC do DHCP/MAC check" />
              <UInput v-model="ipAddress" placeholder="IP do ping/ARP-ping" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <UButton
                label="DHCP/Ping/ARP"
                icon="i-lucide-radar"
                :loading="loading === 'mikrotik-check'"
                @click="runMikrotikCheck"
              />
              <UButton
                label="Bridge/FDB"
                icon="i-lucide-search"
                variant="subtle"
                :loading="loading === 'mac-check'"
                @click="runMacCheck"
              />
            </div>
          </div>

          <div v-else-if="isDasanDevice" class="space-y-3 border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              Dasan OLT
            </div>
            <UButton
              block
              label="Importuj ONU do FTTH"
              icon="i-lucide-git-branch"
              :loading="loading === 'dasan/onus'"
              @click="runImport('dasan/onus')"
            />
            <UButton
              block
              label="Importuj IP-host FTTH"
              icon="i-lucide-router"
              variant="subtle"
              :loading="loading === 'dasan/ip-hosts'"
              @click="runImport('dasan/ip-hosts')"
            />
            <UButton
              block
              label="Mapuj MAC FTTH"
              icon="i-lucide-list-tree"
              variant="subtle"
              :loading="loading === 'dasan/mac-map'"
              @click="runImport('dasan/mac-map')"
            />
            <UInput v-model="macAddress" placeholder="MAC do show mac | include" />
            <UButton
              block
              label="show mac | include"
              icon="i-lucide-search"
              variant="subtle"
              :loading="loading === 'mac-check'"
              @click="runMacCheck"
            />
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="oltPort" placeholder="Port OLT" />
              <UInput v-model="onuId" placeholder="ONU ID" />
            </div>
            <UButton
              block
              label="show onu ip-host"
              icon="i-lucide-router"
              variant="subtle"
              :loading="loading === 'onu-ip-host'"
              @click="runOnuIpHost"
            />
            <UButton
              block
              label="Command tree"
              icon="i-lucide-terminal"
              variant="subtle"
              :loading="loading === 'command-tree'"
              @click="runCommandTree"
            />
          </div>

          <UAlert
            v-else
            color="neutral"
            variant="subtle"
            title="Wybierz MikroTik albo Dasan"
            description="Akcje live są rozdzielone według drivera urządzenia."
          />
        </div>

        <div class="min-w-0 space-y-4 p-4 sm:p-6">
          <div v-if="leases.length" class="border border-default">
            <div class="mb-3 flex items-center justify-between">
              <div class="text-sm font-semibold text-highlighted">
                DHCP leases
              </div>
              <UBadge color="neutral" variant="subtle">
                {{ leases.length }} / {{ leaseTotal }}
              </UBadge>
            </div>
            <AppDataTable
              :data="leases"
              :columns="leaseColumns"
              :context-items="leaseContextItems"
            />
          </div>
          <div v-if="importRows.length" class="space-y-3 border border-default p-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-highlighted">
                  Podglad importu
                </div>
                <div class="text-xs text-muted">
                  {{ filteredImportRows.length }} / {{ importRows.length }} pozycji po filtrze
                </div>
              </div>
              <USelect v-model="importFilter" :items="importFilterItems" class="w-56" />
            </div>
            <AppDataTable
              :data="filteredImportRows"
              :columns="importColumns"
              :page-size="20"
            />
            <details class="border border-default bg-default">
              <summary class="cursor-pointer px-3 py-2 text-sm font-medium text-highlighted">
                Dane techniczne
              </summary>
              <pre class="max-h-[360px] overflow-auto border-t border-default bg-elevated p-3 text-xs">{{ JSON.stringify(result, null, 2) }}</pre>
            </details>
          </div>
          <AppDiagnosticResult v-else :result="result" />
        </div>
      </div>
      <AppRowDetailsSlideover
        v-model:open="leaseDetailsOpen"
        title="Szczegóły DHCP lease"
        :subtitle="selectedLease?.address || selectedLease?.macAddress"
        :item="selectedLease"
      />
    </template>
  </UDashboardPanel>
</template>

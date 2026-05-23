<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface CustomerDeviceRow {
  id: string
  hostname: string
  ipAddress?: string | null
  macAddress?: string | null
  status: string
  importIssues?: string[]
  customer: { fullName: string }
  equipment?: { inventoryId: string } | null
  onuEquipment?: { inventoryId: string } | null
  subscriptions?: Array<{ tariff: { name: string } }>
}

const toast = useToast()
const selectedDevice = ref<CustomerDeviceRow | null>(null)
const diagnostic = ref<unknown>(null)
const loadingAction = ref('')
const diagnosticOpen = ref(false)
const query = ref('')
const issueFilter = ref<'all' | 'issues'>('all')
const editOpen = ref(false)
const archiveOpen = ref(false)
const archiveReason = ref('')
const editState = reactive<{
  hostname?: string
  ipAddress?: string
  macAddress?: string
  status?: string
}>({})
const { data, status, refresh } = await useFetch<{ success: boolean, data: CustomerDeviceRow[] }>('/api/crm/customer-devices', {
  default: () => ({ success: false, data: [] })
})
const columns: TableColumn<CustomerDeviceRow>[] = [
  { accessorKey: 'customer.fullName', header: 'Klient' },
  { accessorKey: 'hostname', header: 'Hostname' },
  { accessorKey: 'ipAddress', header: 'IP' },
  { accessorKey: 'macAddress', header: 'MAC' },
  { accessorKey: 'equipment.inventoryId', header: 'Router/OLT' },
  { accessorKey: 'onuEquipment.inventoryId', header: 'ONU' },
  {
    id: 'subscriptions',
    header: 'Subskrypcje',
    cell: ({ row }) => row.original.subscriptions?.map(item => item.tariff.name).join(', ') || 'Brak'
  },
  { accessorKey: 'status', header: 'Status' },
  {
    id: 'importIssues',
    header: 'Braki',
    cell: ({ row }) => row.original.importIssues?.length ? row.original.importIssues.join(', ') : 'Brak'
  }
]

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.customer.fullName, row.hostname, row.ipAddress, row.macAddress, row.status].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const matchesIssues = issueFilter.value === 'all' || Boolean(row.importIssues?.length)
  return matchesQuery && matchesIssues
}))

async function runAction(action: 'check' | 'olt-lookup' | 'sync-lease') {
  if (!selectedDevice.value) return
  loadingAction.value = action
  try {
    diagnostic.value = await $fetch(`/api/diagnostics/customer-devices/${selectedDevice.value.id}/${action}`, { method: 'POST' })
  } catch (error) {
    toast.add({ title: 'Diagnostyka nie powiodła się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loadingAction.value = ''
  }
}

function openDiagnostics(row: CustomerDeviceRow, action?: 'check' | 'olt-lookup' | 'sync-lease') {
  selectedDevice.value = row
  diagnostic.value = null
  diagnosticOpen.value = true
  if (action) void runAction(action)
}

function openEdit(row: CustomerDeviceRow) {
  selectedDevice.value = row
  Object.assign(editState, {
    hostname: row.hostname,
    ipAddress: row.ipAddress || undefined,
    macAddress: row.macAddress || undefined,
    status: row.status
  })
  editOpen.value = true
}

async function saveDevice() {
  if (!selectedDevice.value) return
  await $fetch(`/api/crm/customer-devices/${selectedDevice.value.id}`, {
    method: 'PATCH',
    body: editState
  })
  toast.add({ title: 'Urządzenie zapisane', color: 'success' })
  editOpen.value = false
  await refresh()
}

function openArchive(row: CustomerDeviceRow) {
  selectedDevice.value = row
  archiveReason.value = ''
  archiveOpen.value = true
}

async function archiveDevice() {
  if (!selectedDevice.value) return
  await $fetch(`/api/crm/customer-devices/${selectedDevice.value.id}`, {
    method: 'DELETE',
    body: { archiveReason: archiveReason.value || null }
  })
  toast.add({ title: 'Urządzenie zarchiwizowane', color: 'success' })
  archiveOpen.value = false
  await refresh()
}

function rowContextItems(row: CustomerDeviceRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Panel diagnostyczny', icon: 'i-lucide-activity', onSelect: () => openDiagnostics(row) },
    { label: 'Ping / ARP / DHCP', icon: 'i-lucide-radar', onSelect: () => openDiagnostics(row, 'check') },
    { label: 'OLT lookup', icon: 'i-lucide-git-branch', onSelect: () => openDiagnostics(row, 'olt-lookup') },
    { label: 'Sync lease', icon: 'i-lucide-refresh-cw', onSelect: () => openDiagnostics(row, 'sync-lease') }
  ], [
    { label: 'Archiwizuj', icon: 'i-lucide-archive', color: 'error', onSelect: () => openArchive(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="crm-customer-devices" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Urządzenia klienta">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj"
            class="w-56"
          />
          <USelect
            v-model="issueFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Tylko z brakami', value: 'issues' }
            ]"
            class="w-44"
          />
          <UButton
            label="Odśwież"
            icon="i-lucide-refresh-cw"
            variant="subtle"
            @click="refresh()"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <AppDataTable
        :data="rows"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <USlideover v-model:open="diagnosticOpen" title="Panel diagnostyczny" :description="selectedDevice?.hostname">
        <template #body>
          <div v-if="selectedDevice" class="space-y-4">
            <div class="text-sm text-muted">
              {{ selectedDevice.hostname }} / {{ selectedDevice.ipAddress || selectedDevice.macAddress }}
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                label="Ping/ARP/DHCP"
                icon="i-lucide-radar"
                :loading="loadingAction === 'check'"
                @click="runAction('check')"
              />
              <UButton
                size="xs"
                label="OLT lookup"
                icon="i-lucide-git-branch"
                variant="subtle"
                :loading="loadingAction === 'olt-lookup'"
                @click="runAction('olt-lookup')"
              />
              <UButton
                size="xs"
                label="Sync lease"
                icon="i-lucide-refresh-cw"
                variant="subtle"
                :loading="loadingAction === 'sync-lease'"
                @click="runAction('sync-lease')"
              />
            </div>
            <AppDiagnosticResult :result="diagnostic" />
          </div>
          <div v-else class="text-sm text-muted">
            Wybierz urządzenie z tabeli.
          </div>
        </template>
      </USlideover>
      <USlideover v-model:open="editOpen" title="Edytuj urządzenie klienta" :description="selectedDevice?.customer.fullName">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Hostname">
              <UInput v-model="editState.hostname" class="w-full" />
            </UFormField>
            <UFormField label="IP">
              <UInput v-model="editState.ipAddress" class="w-full" />
            </UFormField>
            <UFormField label="MAC">
              <UInput v-model="editState.macAddress" class="w-full" />
            </UFormField>
            <UFormField label="Status">
              <USelect v-model="editState.status" :items="['ACTIVE', 'INACTIVE', 'BLOCKED']" class="w-full" />
            </UFormField>
            <UButton label="Zapisz" icon="i-lucide-save" @click="saveDevice" />
          </div>
        </template>
      </USlideover>
      <UModal v-model:open="archiveOpen" title="Archiwizuj urządzenie">
        <template #body>
          <div class="space-y-4">
            <UAlert color="warning" variant="subtle" title="Rekord zostanie ukryty z listy domyślnej." />
            <UTextarea v-model="archiveReason" placeholder="Powód archiwizacji" class="w-full" />
          </div>
        </template>
        <template #footer>
          <UButton
            label="Anuluj"
            color="neutral"
            variant="subtle"
            @click="archiveOpen = false"
          />
          <UButton
            label="Archiwizuj"
            color="error"
            icon="i-lucide-archive"
            @click="archiveDevice"
          />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

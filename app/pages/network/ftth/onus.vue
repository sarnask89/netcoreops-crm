<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface FtthOnuRow {
  id: string
  oltInventoryId: string
  ponPortCode: string
  onuIdentifier: string
  serialNumber?: string | null
  status: string
  signalRx?: string | null
  transparentCandidate: boolean
  lastSeenAt?: string | null
  equipment?: { id: string, inventoryId: string, hostname?: string | null } | null
  managementIpHosts: Array<{ currentIp?: string | null, macAddress?: string | null, hostName?: string | null }>
  accessMacs: Array<{ macAddress: string, vlanId?: number | null }>
  managementMacs: Array<{ macAddress: string, vlanId?: number | null }>
  transparentLinks: Array<Record<string, unknown>>
  linkedCustomerNames: string[]
}

interface CustomerDeviceRow {
  id: string
  hostname: string
  ipAddress?: string | null
  macAddress?: string | null
  customer: { fullName: string }
}

interface OptionsResponse {
  success: boolean
  data: {
    equipment: Array<{ id: string, inventoryId: string, hostname?: string | null, managementIp?: string | null }>
  }
}

const toast = useToast()
const detailsOpen = ref(false)
const linkCustomerOpen = ref(false)
const linkEquipmentOpen = ref(false)
const detailsTitle = ref('Szczegóły ONU')
const selectedRow = ref<FtthOnuRow | null>(null)
const detailsItem = ref<unknown>(null)
const query = ref('')
const statusFilter = ref<'all' | 'ACTIVE' | 'UNKNOWN' | 'OFFLINE'>('all')
const customerDeviceId = ref<string | null>(null)
const networkEquipmentId = ref<string | null>(null)

const { data, status, refresh } = await useFetch<{ success: boolean, data: FtthOnuRow[] }>('/api/ftth/onuses', {
  default: () => ({ success: false, data: [] })
})
const { data: devices, refresh: refreshDevices } = await useFetch<{ success: boolean, data: CustomerDeviceRow[] }>('/api/crm/customer-devices', {
  default: () => ({ success: false, data: [] })
})
const { data: options, refresh: refreshOptions } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { equipment: [] } })
})

const customerDeviceItems = computed(() => [
  { label: 'Odłącz wszystkie urządzenia klienta', value: null },
  ...devices.value.data.map(device => ({
    label: [device.customer.fullName, device.hostname, device.ipAddress, device.macAddress].filter(Boolean).join(' - '),
    value: device.id
  }))
])
const equipmentItems = computed(() => [
  { label: 'Odłącz sprzęt szkieletowy', value: null },
  ...options.value.data.equipment.map(equipment => ({
    label: [equipment.inventoryId, equipment.hostname, equipment.managementIp].filter(Boolean).join(' - '),
    value: equipment.id
  }))
])

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.oltInventoryId, row.ponPortCode, row.onuIdentifier, row.serialNumber, row.status, row.equipment?.inventoryId, ...row.linkedCustomerNames].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const matchesStatus = statusFilter.value === 'all' || row.status.toUpperCase() === statusFilter.value
  return matchesQuery && matchesStatus
}))

const columns: TableColumn<FtthOnuRow>[] = [
  { accessorKey: 'oltInventoryId', header: 'OLT' },
  { accessorKey: 'ponPortCode', header: 'PON' },
  { accessorKey: 'onuIdentifier', header: 'ONU ID' },
  { accessorKey: 'serialNumber', header: 'Serial' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'signalRx', header: 'RX' },
  {
    id: 'managementIp',
    header: 'IP-host / VLAN 400',
    cell: ({ row }) => row.original.managementIpHosts.map(host => host.currentIp).filter(Boolean).join(', ') || 'Brak'
  },
  {
    id: 'accessMacs',
    header: 'MAC access',
    cell: ({ row }) => row.original.accessMacs.length
  },
  {
    id: 'transparent',
    header: 'Transparent',
    cell: ({ row }) => row.original.transparentCandidate ? 'Tak' : 'Nie'
  },
  {
    id: 'customers',
    header: 'Klienci',
    cell: ({ row }) => row.original.linkedCustomerNames.join(', ') || 'Brak'
  },
  {
    id: 'equipment',
    header: 'Sprzęt',
    cell: ({ row }) => row.original.equipment?.inventoryId || 'Brak'
  }
]

async function refreshAll() {
  await Promise.all([refresh(), refreshDevices(), refreshOptions()])
}

function showDetails(row: FtthOnuRow, item: unknown = row, title = 'Szczegóły ONU') {
  selectedRow.value = row
  detailsItem.value = item
  detailsTitle.value = title
  detailsOpen.value = true
}

function openCustomerLink(row: FtthOnuRow) {
  selectedRow.value = row
  customerDeviceId.value = null
  linkCustomerOpen.value = true
}

function openEquipmentLink(row: FtthOnuRow) {
  selectedRow.value = row
  networkEquipmentId.value = row.equipment?.id || null
  linkEquipmentOpen.value = true
}

async function saveCustomerLink() {
  if (!selectedRow.value) return
  await $fetch(`/api/ftth/onuses/${selectedRow.value.id}/link-customer`, {
    method: 'POST',
    body: { customerDeviceId: customerDeviceId.value }
  })
  toast.add({ title: 'Powiązanie z klientem zapisane', color: 'success' })
  linkCustomerOpen.value = false
  await refreshAll()
}

async function saveEquipmentLink() {
  if (!selectedRow.value) return
  await $fetch(`/api/ftth/onuses/${selectedRow.value.id}/link-equipment`, {
    method: 'POST',
    body: { networkEquipmentId: networkEquipmentId.value }
  })
  toast.add({ title: 'Powiązanie ze sprzętem zapisane', color: 'success' })
  linkEquipmentOpen.value = false
  await refreshAll()
}

function rowContextItems(row: FtthOnuRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły ONU', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'MAC table', icon: 'i-lucide-list-tree', onSelect: () => showDetails(row, row.accessMacs, 'MAC table') },
    { label: 'IP-host / VLAN 400', icon: 'i-lucide-router', onSelect: () => showDetails(row, row.managementIpHosts, 'IP-host / VLAN 400') },
    { label: 'RX power', icon: 'i-lucide-activity', onSelect: () => showDetails(row, { onu: row.onuIdentifier, signalRx: row.signalRx }, 'RX power') },
    { label: 'Transparent bridge analysis', icon: 'i-lucide-link', onSelect: () => showDetails(row, row.transparentLinks, 'Transparent bridge analysis') }
  ], [
    { label: 'Powiąż z klientem', icon: 'i-lucide-user-round-plus', onSelect: () => openCustomerLink(row) },
    { label: 'Powiąż ze sprzętem szkieletowym', icon: 'i-lucide-server-cog', onSelect: () => openEquipmentLink(row) }
  ], [
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refreshAll() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-ftth-onus" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH ONU">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj ONU"
            class="w-28 sm:w-56"
          />
          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Aktywne', value: 'ACTIVE' },
              { label: 'Nieznane', value: 'UNKNOWN' },
              { label: 'Offline', value: 'OFFLINE' }
            ]"
            class="w-28 sm:w-40"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            variant="outline"
            color="neutral"
            @click="() => refreshAll()"
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
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        :title="detailsTitle"
        :subtitle="selectedRow ? `${selectedRow.oltInventoryId} ${selectedRow.ponPortCode}/${selectedRow.onuIdentifier}` : undefined"
        :item="detailsItem"
      />
      <USlideover
        v-model:open="linkCustomerOpen"
        title="Powiąż ONU z klientem"
        :description="selectedRow ? `${selectedRow.oltInventoryId} ${selectedRow.ponPortCode}/${selectedRow.onuIdentifier}` : undefined"
      >
        <template #body>
          <div class="space-y-4">
            <UFormField label="Urządzenie klienta">
              <USelect
                v-model="customerDeviceId"
                :items="customerDeviceItems"
                class="w-full"
              />
            </UFormField>
            <UButton
              label="Zapisz powiązanie"
              icon="i-lucide-save"
              @click="saveCustomerLink"
            />
          </div>
        </template>
      </USlideover>
      <USlideover
        v-model:open="linkEquipmentOpen"
        title="Powiąż ONU ze sprzętem"
        :description="selectedRow ? `${selectedRow.oltInventoryId} ${selectedRow.ponPortCode}/${selectedRow.onuIdentifier}` : undefined"
      >
        <template #body>
          <div class="space-y-4">
            <UFormField label="Sprzęt szkieletowy / CPE">
              <USelect
                v-model="networkEquipmentId"
                :items="equipmentItems"
                class="w-full"
              />
            </UFormField>
            <UButton
              label="Zapisz powiązanie"
              icon="i-lucide-save"
              @click="saveEquipmentLink"
            />
          </div>
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface FtthMacMapRow {
  id: string
  macAddress: string
  vlanId?: number | null
  gemId?: string | null
  sourceCommand: string
  status: string
  lastSeenAt?: string | null
  onu: {
    onuIdentifier: string
    status: string
    transparentCandidate: boolean
    ponPort: {
      portCode: string
      olt: { equipment: { inventoryId: string } }
    }
  }
  transparentLink?: {
    linkType: string
    confidence: number
    customerDevice?: { hostname: string, customer: { fullName: string } } | null
    backboneEquipment?: { inventoryId: string, hostname?: string | null } | null
  } | null
}

const detailsOpen = ref(false)
const selectedRow = ref<FtthMacMapRow | null>(null)
const query = ref('')

const { data, status, refresh } = await useFetch<{ success: boolean, data: FtthMacMapRow[] }>('/api/ftth/mac-map', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => data.value.data.filter((row) => {
  const text = [
    row.macAddress,
    row.vlanId,
    row.gemId,
    row.status,
    row.transparentLink?.linkType,
    row.onu.ponPort.olt.equipment.inventoryId,
    row.onu.ponPort.portCode,
    row.onu.onuIdentifier,
    row.transparentLink?.customerDevice?.customer.fullName,
    row.transparentLink?.backboneEquipment?.inventoryId
  ].filter(Boolean).join(' ').toLowerCase()
  return !query.value || text.includes(query.value.toLowerCase())
}))

const columns: TableColumn<FtthMacMapRow>[] = [
  {
    id: 'onu',
    header: 'ONU',
    cell: ({ row }) => `${row.original.onu.ponPort.olt.equipment.inventoryId} ${row.original.onu.ponPort.portCode}/${row.original.onu.onuIdentifier}`
  },
  { accessorKey: 'macAddress', header: 'MAC za ONU' },
  { accessorKey: 'vlanId', header: 'VLAN' },
  { accessorKey: 'gemId', header: 'GEM' },
  { accessorKey: 'status', header: 'Status MAC' },
  {
    id: 'mapping',
    header: 'Mapowanie',
    cell: ({ row }) => row.original.transparentLink?.linkType || (row.original.onu.transparentCandidate ? 'Transparent candidate' : 'MAC OLT')
  },
  {
    id: 'target',
    header: 'Powiązanie',
    cell: ({ row }) => row.original.transparentLink?.customerDevice?.customer.fullName || row.original.transparentLink?.backboneEquipment?.inventoryId || 'Brak'
  },
  {
    id: 'confidence',
    header: 'Pewność',
    cell: ({ row }) => row.original.transparentLink?.confidence ?? 'Brak'
  },
  { accessorKey: 'lastSeenAt', header: 'Ostatnio widziany' }
]

function showDetails(row: FtthMacMapRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: FtthMacMapRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły MAC', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-ftth-mac-map" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH MAC map">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj MAC"
            class="w-32 sm:w-56"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            variant="outline"
            color="neutral"
            @click="() => refresh()"
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
        title="Szczegóły MAC"
        :subtitle="selectedRow?.macAddress"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

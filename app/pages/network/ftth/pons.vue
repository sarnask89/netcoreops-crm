<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface FtthPonRow {
  id: string
  portCode: string
  label?: string | null
  status: string
  oltInventoryId: string
  oltManagementIp?: string | null
  nodeName?: string | null
  driverCode?: string | null
  onuCount: number
  activeOnuCount: number
  transparentCandidateCount: number
}

const detailsOpen = ref(false)
const selectedRow = ref<FtthPonRow | null>(null)
const query = ref('')

const { data, status, refresh } = await useFetch<{ success: boolean, data: FtthPonRow[] }>('/api/ftth/pons', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.oltInventoryId, row.portCode, row.label, row.status, row.nodeName, row.oltManagementIp].filter(Boolean).join(' ').toLowerCase()
  return !query.value || text.includes(query.value.toLowerCase())
}))

const columns: TableColumn<FtthPonRow>[] = [
  { accessorKey: 'oltInventoryId', header: 'OLT' },
  { accessorKey: 'portCode', header: 'PON' },
  { accessorKey: 'label', header: 'Opis' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'onuCount', header: 'ONU' },
  { accessorKey: 'activeOnuCount', header: 'Aktywne' },
  { accessorKey: 'transparentCandidateCount', header: 'Transparent' },
  { accessorKey: 'nodeName', header: 'Węzeł' }
]

function showDetails(row: FtthPonRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: FtthPonRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły PON', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-ftth-pons" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH PON">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj PON"
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
        title="Szczegóły PON"
        :subtitle="selectedRow ? `${selectedRow.oltInventoryId} / ${selectedRow.portCode}` : undefined"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

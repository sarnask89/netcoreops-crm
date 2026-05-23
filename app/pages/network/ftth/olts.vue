<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface FtthOltRow {
  id: string
  vendor: string
  model?: string | null
  managementVlanId: number
  ponPortCount: number
  onuCount: number
  activeOnuCount: number
  equipment: {
    inventoryId: string
    hostname?: string | null
    managementIp?: string | null
    node?: { name: string } | null
    managementDriver?: { code: string, label: string } | null
  }
}

const detailsOpen = ref(false)
const selectedRow = ref<FtthOltRow | null>(null)
const query = ref('')

const { data, status, refresh } = await useFetch<{ success: boolean, data: FtthOltRow[] }>('/api/ftth/olts', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.equipment.inventoryId, row.equipment.hostname, row.equipment.managementIp, row.vendor, row.model, row.equipment.node?.name].filter(Boolean).join(' ').toLowerCase()
  return !query.value || text.includes(query.value.toLowerCase())
}))

const columns: TableColumn<FtthOltRow>[] = [
  { accessorKey: 'equipment.inventoryId', header: 'OLT' },
  { accessorKey: 'equipment.managementIp', header: 'IP zarządzania' },
  { accessorKey: 'vendor', header: 'Vendor' },
  { accessorKey: 'model', header: 'Model' },
  { accessorKey: 'managementVlanId', header: 'VLAN mgmt' },
  { accessorKey: 'ponPortCount', header: 'PON' },
  { accessorKey: 'onuCount', header: 'ONU' },
  { accessorKey: 'activeOnuCount', header: 'Aktywne' },
  { accessorKey: 'equipment.node.name', header: 'Węzeł' }
]

function showDetails(row: FtthOltRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: FtthOltRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły OLT', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-ftth-olts" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH OLT">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj OLT"
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
        title="Szczegóły OLT"
        :subtitle="selectedRow?.equipment.inventoryId"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

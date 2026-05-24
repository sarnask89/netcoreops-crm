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
    model?: { manufacturer: string, modelName: string } | null
    node?: { name: string } | null
    managementDriver?: { code: string, label: string } | null
  }
}

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
  equipment?: { inventoryId: string, hostname?: string | null } | null
  managementIpHosts: Array<{ currentIp?: string | null, macAddress?: string | null, hostName?: string | null }>
  accessMacs: Array<{ macAddress: string, vlanId?: number | null }>
  managementMacs: Array<{ macAddress: string, vlanId?: number | null }>
  transparentLinks: Array<{
    macAddress: string
    linkType: string
    customerDevice?: { hostname: string, customer: { fullName: string } } | null
    backboneEquipment?: { inventoryId: string, hostname?: string | null } | null
  }>
  linkedCustomerNames: string[]
}

interface TransparentLinkRow {
  id: string
  macAddress: string
  linkType: string
  confidence: number
  onu: {
    onuIdentifier: string
    ponPort: {
      portCode: string
      olt: {
        equipment: {
          inventoryId: string
        }
      }
    }
  }
  customerDevice?: { hostname: string, customer: { fullName: string } } | null
  backboneEquipment?: { inventoryId: string, hostname?: string | null } | null
}

const tab = ref('onus')
const detailsOpen = ref(false)
const selectedRow = ref<unknown>(null)

const { data: olts, status: oltsStatus, refresh: refreshOlts } = await useFetch<{ success: boolean, data: FtthOltRow[] }>('/api/ftth/olts', {
  default: () => ({ success: false, data: [] })
})
const { data: onus, status: onusStatus, refresh: refreshOnus } = await useFetch<{ success: boolean, data: FtthOnuRow[] }>('/api/ftth/onuses', {
  default: () => ({ success: false, data: [] })
})
const { data: links, status: linksStatus, refresh: refreshLinks } = await useFetch<{ success: boolean, data: TransparentLinkRow[] }>('/api/ftth/transparent-links', {
  default: () => ({ success: false, data: [] })
})

const tabs = [{
  label: 'ONU',
  value: 'onus',
  icon: 'i-lucide-router'
}, {
  label: 'OLT',
  value: 'olts',
  icon: 'i-lucide-server'
}, {
  label: 'Transparent links',
  value: 'links',
  icon: 'i-lucide-link'
}]

const oltColumns: TableColumn<FtthOltRow>[] = [
  { accessorKey: 'equipment.inventoryId', header: 'OLT' },
  { accessorKey: 'equipment.managementIp', header: 'IP zarządzania' },
  {
    id: 'model',
    header: 'Model',
    cell: ({ row }) => row.original.model || [row.original.equipment.model?.manufacturer, row.original.equipment.model?.modelName].filter(Boolean).join(' ') || 'Brak'
  },
  { accessorKey: 'vendor', header: 'Vendor' },
  { accessorKey: 'managementVlanId', header: 'VLAN mgmt' },
  { accessorKey: 'ponPortCount', header: 'PON' },
  { accessorKey: 'onuCount', header: 'ONU' },
  { accessorKey: 'activeOnuCount', header: 'Aktywne' },
  { accessorKey: 'equipment.node.name', header: 'Węzeł' }
]

const onuColumns: TableColumn<FtthOnuRow>[] = [
  { accessorKey: 'oltInventoryId', header: 'OLT' },
  { accessorKey: 'ponPortCode', header: 'PON' },
  { accessorKey: 'onuIdentifier', header: 'ONU ID' },
  { accessorKey: 'serialNumber', header: 'Serial' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'signalRx', header: 'RX' },
  {
    id: 'managementIp',
    header: 'IP zarządzania',
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
  }
]

const linkColumns: TableColumn<TransparentLinkRow>[] = [
  {
    id: 'onu',
    header: 'ONU',
    cell: ({ row }) => `${row.original.onu.ponPort.olt.equipment.inventoryId} ${row.original.onu.ponPort.portCode}/${row.original.onu.onuIdentifier}`
  },
  { accessorKey: 'macAddress', header: 'MAC za ONU' },
  { accessorKey: 'linkType', header: 'Typ' },
  {
    id: 'target',
    header: 'Powiązanie',
    cell: ({ row }) => row.original.customerDevice?.customer.fullName || row.original.backboneEquipment?.inventoryId || 'Brak'
  },
  { accessorKey: 'confidence', header: 'Pewność' }
]

function showDetails(row: unknown) {
  selectedRow.value = row
  detailsOpen.value = true
}

function contextItems(row: unknown): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) }
  ], [
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refreshAll() }
  ]]
}

async function refreshAll() {
  await Promise.all([refreshOlts(), refreshOnus(), refreshLinks()])
}
</script>

<template>
  <UDashboardPanel id="network-ftth" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH / GPON">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Odśwież"
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            @click="refreshAll"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UTabs v-model="tab" :items="tabs" size="sm" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <AppDataTable
        v-if="tab === 'onus'"
        :data="onus.data"
        :columns="onuColumns"
        :loading="onusStatus === 'pending'"
        :context-items="contextItems"
      />
      <AppDataTable
        v-else-if="tab === 'olts'"
        :data="olts.data"
        :columns="oltColumns"
        :loading="oltsStatus === 'pending'"
        :context-items="contextItems"
      />
      <AppDataTable
        v-else
        :data="links.data"
        :columns="linkColumns"
        :loading="linksStatus === 'pending'"
        :context-items="contextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły FTTH"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

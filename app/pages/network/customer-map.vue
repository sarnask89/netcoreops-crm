<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface CustomerLocationNode {
  id: string
  name: string
  nodeType: string
  status: string
}

interface CustomerLocationRow {
  customerId: string
  customerName: string
  customerType: string
  contactPhone: string | null
  contactEmail: string | null
  address: string
  deviceCount: number
  activeSubscriptionCount: number
  nodes: CustomerLocationNode[]
}

const query = ref('')
const nodeFilter = ref<'all' | 'linked' | 'unlinked'>('all')

const { data, status, refresh } = await useFetch<{ success: boolean, data: CustomerLocationRow[] }>('/api/network/topology/customer-locations', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.customerName, row.address, row.contactPhone, row.contactEmail, ...row.nodes.map(node => node.name)].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const matchesNodeFilter = nodeFilter.value === 'all'
    || (nodeFilter.value === 'linked' && row.nodes.length > 0)
    || (nodeFilter.value === 'unlinked' && row.nodes.length === 0)
  return matchesQuery && matchesNodeFilter
}))

const groupedByLocality = computed(() => {
  const groups = new Map<string, CustomerLocationRow[]>()
  for (const row of rows.value) {
    const locality = row.address.split(',').at(-1)?.trim() || 'Brak miejscowości'
    groups.set(locality, [...(groups.get(locality) ?? []), row])
  }
  return [...groups.entries()].map(([locality, items]) => ({ locality, items }))
})

const columns: TableColumn<CustomerLocationRow>[] = [
  { accessorKey: 'customerName', header: 'Klient' },
  { accessorKey: 'address', header: 'Adres' },
  { accessorKey: 'deviceCount', header: 'Urządzenia' },
  { accessorKey: 'activeSubscriptionCount', header: 'Aktywne usługi' },
  {
    id: 'nodes',
    header: 'Węzły',
    cell: ({ row }) => row.original.nodes.map(node => node.name).join(', ') || 'Brak powiązania'
  }
]
</script>

<template>
  <UDashboardPanel id="network-topology-customers" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Mapa lokalizacji klientów">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/network/topology"
          />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Klient, adres, węzeł"
            class="w-64"
          />
          <USelect
            v-model="nodeFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Z węzłem', value: 'linked' },
              { label: 'Bez węzła', value: 'unlinked' }
            ]"
            class="w-40"
          />
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-refresh-cw"
            @click="refresh()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <div class="space-y-3">
          <UCard>
            <template #header>
              <span class="font-medium">Warstwy TERYT</span>
            </template>
            <div class="space-y-3">
              <div
                v-for="group in groupedByLocality"
                :key="group.locality"
                class="rounded-lg border p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="font-medium">
                    {{ group.locality }}
                  </div>
                  <UBadge variant="subtle">
                    {{ group.items.length }} klientów
                  </UBadge>
                </div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{ width: `${Math.min(100, group.items.length * 12)}%` }"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-3">
            <UCard>
              <div class="text-xs text-muted-foreground">
                Lokalizacje
              </div>
              <div class="text-2xl font-semibold">
                {{ rows.length }}
              </div>
            </UCard>
            <UCard>
              <div class="text-xs text-muted-foreground">
                Urządzenia klienta
              </div>
              <div class="text-2xl font-semibold">
                {{ rows.reduce((sum, row) => sum + row.deviceCount, 0) }}
              </div>
            </UCard>
            <UCard>
              <div class="text-xs text-muted-foreground">
                Powiązane z topologią
              </div>
              <div class="text-2xl font-semibold">
                {{ rows.filter(row => row.nodes.length > 0).length }}
              </div>
            </UCard>
          </div>

          <AppDataTable
            :data="rows"
            :columns="columns"
            :loading="status === 'pending'"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

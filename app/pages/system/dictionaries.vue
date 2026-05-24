<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

type TabKey = 'media' | 'technologies' | 'teryt' | 'simc' | 'ulic'
type DictionaryRow = Record<string, unknown>
interface DictionariesResponse {
  success: boolean
  data: Record<TabKey, DictionaryRow[]>
}

const active = ref<TabKey>('teryt')
const detailsOpen = ref(false)
const selectedRow = ref<DictionaryRow | null>(null)
const { data, status, refresh } = await useFetch<DictionariesResponse>('/api/system/dictionaries', {
  default: () => ({
    success: false,
    data: { media: [], technologies: [], teryt: [], simc: [], ulic: [] }
  })
})

const tabs = [
  { label: 'TERYT', value: 'teryt' },
  { label: 'SIMC', value: 'simc' },
  { label: 'ULIC', value: 'ulic' },
  { label: 'Media UKE', value: 'media' },
  { label: 'Technologie UKE', value: 'technologies' }
]

const columns = computed<TableColumn<DictionaryRow>[]>(() => {
  if (active.value === 'teryt') {
    return [
      { accessorKey: 'terytCode', header: 'TERYT' },
      { accessorKey: 'name', header: 'Nazwa' },
      { accessorKey: 'areaType', header: 'Typ' },
      { accessorKey: 'county', header: 'Powiat' },
      { accessorKey: 'commune', header: 'Gmina' }
    ]
  }

  if (active.value === 'simc') {
    return [
      { accessorKey: 'simcCode', header: 'SIMC' },
      { accessorKey: 'name', header: 'Miejscowość' },
      { accessorKey: 'localityType', header: 'Typ' },
      { accessorKey: 'terytArea.terytCode', header: 'TERYT' }
    ]
  }

  if (active.value === 'ulic') {
    return [
      { accessorKey: 'ulicCode', header: 'ULIC' },
      { accessorKey: 'streetType', header: 'Cecha' },
      { accessorKey: 'name', header: 'Ulica' },
      { accessorKey: 'locality.name', header: 'Miejscowość' },
      { accessorKey: 'locality.simcCode', header: 'SIMC' }
    ]
  }

  return [
    { accessorKey: 'code', header: 'Kod' },
    { accessorKey: 'label', header: 'Etykieta' },
    { accessorKey: 'description', header: 'Opis' }
  ]
})

const rows = computed(() => data.value.data[active.value] || [])
const counts = computed(() => ({
  teryt: data.value.data.teryt.length,
  simc: data.value.data.simc.length,
  ulic: data.value.data.ulic.length,
  media: data.value.data.media.length,
  technologies: data.value.data.technologies.length
}))

function showDetails(row: DictionaryRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: DictionaryRow): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły definicji', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="dictionaries" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Definicje i słowniki">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Odśwież"
            icon="i-lucide-refresh-cw"
            variant="subtle"
            @click="refresh()"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UTabs v-model="active" :items="tabs" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid gap-3 p-4 sm:p-6 md:grid-cols-5">
        <div v-for="(count, key) in counts" :key="key" class="border border-default rounded-lg p-3">
          <p class="text-sm text-muted">
            {{ key }}
          </p>
          <p class="text-2xl font-semibold text-highlighted">
            {{ count }}
          </p>
        </div>
      </div>
      <AppDataTable
        :data="rows"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły definicji"
        :subtitle="active"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

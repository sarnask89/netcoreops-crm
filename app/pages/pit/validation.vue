<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface Issue {
  severity: 'error' | 'warning'
  entity: string
  entityId: string
  code: string
  message: string
}

const { data, status, refresh } = await useFetch('/api/pit/validation', {
  default: () => ({
    success: false,
    data: { errors: [], warnings: [], summary: { errors: 0, warnings: 0, readyForExport: false } }
  })
})

const rows = computed<Issue[]>(() => [
  ...data.value.data.errors,
  ...data.value.data.warnings
])

const columns: TableColumn<Issue>[] = [
  { accessorKey: 'severity', header: 'Poziom' },
  { accessorKey: 'entity', header: 'Tabela' },
  { accessorKey: 'code', header: 'Kod' },
  { accessorKey: 'message', header: 'Komunikat' }
]

const selectedRow = ref<Issue | null>(null)
const detailsOpen = ref(false)

function showDetails(row: Issue) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: Issue): ContextMenuItem[][] {
  return [[
    { label: 'Szczegóły problemu', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież walidację', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="pit-validation" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Walidacja PIT/UKE">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Sprawdź" icon="i-lucide-shield-check" @click="refresh()" />
          <UButton
            label="Eksport CSV"
            icon="i-lucide-download"
            to="/api/pit/export"
            target="_blank"
            variant="subtle"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-3 p-4 sm:p-6 md:grid-cols-3">
        <UAlert
          :color="data.data.summary.readyForExport ? 'success' : 'warning'"
          variant="subtle"
          icon="i-lucide-activity"
          :title="data.data.summary.readyForExport ? 'Gotowe do eksportu' : 'Wymaga sprawdzenia'"
          description="Walidacja opiera się na powiązaniach słownikowych i integralności relacji."
        />
        <div class="border border-default rounded-lg p-3">
          <p class="text-sm text-muted">
            Błędy
          </p>
          <p class="text-2xl font-semibold text-error">
            {{ data.data.summary.errors }}
          </p>
        </div>
        <div class="border border-default rounded-lg p-3">
          <p class="text-sm text-muted">
            Ostrzeżenia
          </p>
          <p class="text-2xl font-semibold text-warning">
            {{ data.data.summary.warnings }}
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
        title="Szczegóły walidacji"
        :subtitle="selectedRow?.code"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

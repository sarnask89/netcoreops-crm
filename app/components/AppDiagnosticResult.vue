<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface DiagnosticRow {
  name: string
  status: 'ok' | 'warning' | 'error' | 'unsupported'
  summary: string
  recommendation: string
}

interface DiagnosticPresentation {
  status: 'ok' | 'warning' | 'error' | 'unsupported'
  title: string
  target: string
  recommendation: string
  rows: DiagnosticRow[]
  raw: unknown
}

const props = defineProps<{
  result: unknown
}>()

const presentation = computed<DiagnosticPresentation | null>(() => {
  const value = props.result as { data?: { presentation?: DiagnosticPresentation }, presentation?: DiagnosticPresentation } | null
  return value?.data?.presentation || value?.presentation || null
})

const raw = computed(() => {
  const value = props.result as { data?: unknown } | null
  return presentation.value?.raw || value?.data || props.result
})

const colorByStatus = {
  ok: 'success',
  warning: 'warning',
  error: 'error',
  unsupported: 'neutral'
} as const

const labelByStatus = {
  ok: 'OK',
  warning: 'Uwaga',
  error: 'Blad',
  unsupported: 'Nieobslugiwane'
}

const rowColumns: TableColumn<DiagnosticRow>[] = [
  { accessorKey: 'name', header: 'Test' },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  { accessorKey: 'summary', header: 'Wynik' },
  { accessorKey: 'recommendation', header: 'Zalecenie' }
]
</script>

<template>
  <div v-if="presentation" class="space-y-4">
    <UAlert
      :color="colorByStatus[presentation.status]"
      variant="subtle"
      icon="i-lucide-activity"
      :title="presentation.title"
      :description="`${presentation.target} - ${presentation.recommendation}`"
    />

    <UTable
      :data="presentation.rows"
      :columns="rowColumns"
      :ui="{
        root: 'overflow-auto border border-default',
        th: 'h-10 px-3 py-2 text-xs uppercase tracking-wide text-muted',
        td: 'px-3 py-2 text-sm align-top'
      }"
    >
      <template #status-cell="{ row }">
        <UBadge :color="colorByStatus[row.original.status]" variant="subtle">
          {{ labelByStatus[row.original.status] }}
        </UBadge>
      </template>
    </UTable>

    <details class="border border-default bg-default">
      <summary class="cursor-pointer px-3 py-2 text-sm font-medium text-highlighted">
        Dane techniczne
      </summary>
      <pre class="max-h-[420px] overflow-auto border-t border-default bg-elevated p-3 text-xs leading-relaxed">{{ JSON.stringify(raw, null, 2) }}</pre>
    </details>
  </div>
  <pre v-else class="max-h-[620px] overflow-auto border border-muted bg-elevated p-3 text-xs">{{ JSON.stringify(result, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { DashboardAlert, DashboardSummary, Period, Range } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

const UBadge = resolveComponent('UBadge')
const { data: summary } = await useFetch<{ success: boolean, data: DashboardSummary }>('/api/dashboard/summary', {
  watch: [() => props.period, () => props.range],
  default: () => ({
    success: false,
    data: {
      counters: {
        customers: 0,
        customerDevices: 0,
        equipment: 0,
        nodes: 0,
        lines: 0,
        onus: 0,
        activeOnus: 0,
        gponAlerts: 0
      },
      alerts: [],
      telemetry: [],
      netflowInterfaces: [],
      activeUsers: [],
      collectorHealth: [],
      topUsers: []
    }
  })
})

const rows = computed(() => summary.value.data.alerts)

const columns: TableColumn<DashboardAlert>[] = [
  {
    accessorKey: 'severity',
    header: 'Poziom',
    cell: ({ row }) => h(UBadge, {
      color: row.original.severity === 'critical' ? 'error' : 'warning',
      variant: 'subtle'
    }, () => row.original.severity === 'critical' ? 'Krytyczny' : 'Ostrzeżenie')
  },
  {
    accessorKey: 'equipmentInventoryId',
    header: 'OLT'
  },
  {
    id: 'onu',
    header: 'ONU',
    cell: ({ row }) => `PON ${row.original.oltPort} / ONU ${row.original.onuIdentifier}`
  },
  {
    accessorKey: 'signalRx',
    header: 'RX',
    cell: ({ row }) => row.original.signalRx || 'Brak'
  },
  {
    accessorKey: 'message',
    header: 'Opis'
  }
]
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            Skrót alertów
          </p>
          <p class="text-lg text-highlighted font-semibold">
            GPON RX poza zakresem
          </p>
        </div>
        <UButton
          label="FTTH diagnostyka"
          icon="i-lucide-radar"
          color="neutral"
          variant="subtle"
          to="/network/ftth/diagnostics"
        />
      </div>
    </template>

    <UAlert
      v-if="!rows.length"
      color="success"
      variant="subtle"
      icon="i-lucide-circle-check"
      title="Brak alertów GPON RX"
      description="Ostatnie przebiegi nie zgłosiły aktywnych ONU poza skonfigurowanym zakresem mocy."
      class="m-4"
    />

    <UTable
      v-else
      :data="rows"
      :columns="columns"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    />
  </UCard>
</template>

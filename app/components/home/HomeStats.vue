<script setup lang="ts">
import type { DashboardSummary, Period, Range } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

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

const stats = computed(() => [{
  title: 'Klienci',
  icon: 'i-lucide-users',
  value: summary.value.data.counters.customers,
  detail: `${summary.value.data.counters.customerDevices} urządzeń klienta`,
  to: '/crm/customers',
  color: 'primary' as const
}, {
  title: 'Urządzenia sieci',
  icon: 'i-lucide-server',
  value: summary.value.data.counters.equipment,
  detail: `${summary.value.data.counters.nodes} węzłów / ${summary.value.data.counters.lines} linii`,
  to: '/network/equipment',
  color: 'info' as const
}, {
  title: 'Aktywne ONU',
  icon: 'i-lucide-router',
  value: summary.value.data.counters.activeOnus,
  detail: `${summary.value.data.counters.onus} ONU w ewidencji FTTH`,
  to: '/network/ftth/onus',
  color: 'success' as const
}, {
  title: 'Alerty GPON RX',
  icon: 'i-lucide-triangle-alert',
  value: summary.value.data.counters.gponAlerts,
  detail: summary.value.data.counters.gponAlerts ? 'Wymagają sprawdzenia' : 'Brak aktywnych alertów',
  to: '/network/ftth/diagnostics',
  color: summary.value.data.counters.gponAlerts ? 'warning' as const : 'neutral' as const
}])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="stat in stats"
      :key="stat.title"
      :icon="stat.icon"
      :title="stat.title"
      :to="stat.to"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-end justify-between gap-3">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
        <UBadge :color="stat.color" variant="subtle" class="text-xs">
          {{ stat.detail }}
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>

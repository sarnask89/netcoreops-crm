<script setup lang="ts">
import { format } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { DashboardNetflowInterfacePoint, DashboardSummary, DashboardTelemetryPoint, SnmpQueuePoint, SnmpSystemPoint, Period, Range } from '~/types'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const props = defineProps<{
  period: Period
  range: Range
}>()

const { width } = useElementSize(cardRef)
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
      topUsers: [],
      snmpQueues: [],
      snmpSystem: []
    }
  })
})

const data = computed(() => summary.value.data.telemetry)
const x = (_: DashboardTelemetryPoint, i: number) => i
const ySnmp = (row: DashboardTelemetryPoint) => row.snmpSamples
const yNetflow = (row: DashboardTelemetryPoint) => row.netflowSamples
const yAlerts = (row: DashboardTelemetryPoint) => row.alerts

const totals = computed(() => data.value.reduce((acc, row) => ({
  snmp: acc.snmp + row.snmpSamples,
  netflow: acc.netflow + row.netflowSamples,
  alerts: acc.alerts + row.alerts
}), { snmp: 0, netflow: 0, alerts: 0 }))

function formatTimestamp(timestamp: string) {
  return format(new Date(timestamp), 'dd.MM HH:mm')
}

const xTicks = (i: number) => {
  const row = data.value[i]
  if (!row || (i !== 0 && i !== data.value.length - 1 && i % 4 !== 0)) return ''
  return formatTimestamp(row.timestamp)
}

const template = (row: DashboardTelemetryPoint) =>
  `${formatTimestamp(row.timestamp)}: SNMP ${row.snmpSamples}, NetFlow ${row.netflowSamples}, alerty ${row.alerts}`

interface InterfaceChartRow {
  timestamp: string
  rxBps: number
  txBps: number
  rxUtilizationPct: number | null
  txUtilizationPct: number | null
}

interface InterfaceChart {
  key: string
  role: 'uplink' | 'dhcp'
  title: string
  subtitle: string
  color: 'primary' | 'info'
  speedBps?: number
  rows: InterfaceChartRow[]
  totalBytes: number
  peakUtilizationPct: number | null
}

const netflowInterfaces = computed(() => summary.value.data.netflowInterfaces || [])
const activeUsers = computed(() => summary.value.data.activeUsers || [])
const collectorHealth = computed(() => summary.value.data.collectorHealth || [])
const topUsers = computed(() => summary.value.data.topUsers || [])
const snmpQueues = computed(() => summary.value.data.snmpQueues || [])
const snmpSystem = computed(() => summary.value.data.snmpSystem || [])
const activeUserScope = ref<'total' | 'equipment' | 'dhcp-server' | 'interface'>('total')
const activeUserTarget = ref('all')

function formatBytes(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} KB`
  return `${Math.round(value)} B`
}

function formatBps(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} Gb/s`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Mb/s`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} kb/s`
  return `${Math.round(value)} b/s`
}

function formatSpeed(value?: number) {
  return value ? formatBps(value) : 'brak speed'
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'n/d'
  if (value >= 10) return `${value.toFixed(1)}%`
  return `${value.toFixed(2)}%`
}

function formatFlows(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`
}

function interfaceChartKey(point: DashboardNetflowInterfacePoint) {
  return `${point.role}|${point.exporterAddress}|${point.interfaceName}`
}

function emptyInterfaceRow(timestamp: string): InterfaceChartRow {
  return {
    timestamp,
    rxBps: 0,
    txBps: 0,
    rxUtilizationPct: null,
    txUtilizationPct: null
  }
}

const interfaceCharts = computed<InterfaceChart[]>(() => {
  const chartMap = new Map<string, InterfaceChart & { rowsByTimestamp: Map<string, InterfaceChartRow> }>()

  for (const point of netflowInterfaces.value) {
    if (point.role !== 'dhcp' && point.role !== 'uplink') continue
    const key = interfaceChartKey(point)
    const chart = chartMap.get(key) || {
      key,
      role: point.role,
      title: point.interfaceName,
      subtitle: point.sourceInterface
        ? `${point.exporterAddress} / bridge ${point.sourceInterface}`
        : point.exporterAddress,
      color: point.role === 'uplink' ? 'primary' : 'info',
      speedBps: point.speedBps,
      rows: [],
      rowsByTimestamp: new Map<string, InterfaceChartRow>(),
      totalBytes: 0,
      peakUtilizationPct: null
    }
    const row = chart.rowsByTimestamp.get(point.timestamp) || emptyInterfaceRow(point.timestamp)
    if (point.direction === 'output') {
      row.txBps += point.bps
      row.txUtilizationPct = point.utilizationPct
    } else {
      row.rxBps += point.bps
      row.rxUtilizationPct = point.utilizationPct
    }
    chart.totalBytes += point.bytes
    if (typeof point.speedBps === 'number') chart.speedBps = point.speedBps
    if (typeof point.utilizationPct === 'number') {
      chart.peakUtilizationPct = Math.max(chart.peakUtilizationPct || 0, point.utilizationPct)
    }
    chart.rowsByTimestamp.set(point.timestamp, row)
    chartMap.set(key, chart)
  }

  return Array.from(chartMap.values())
    .map(({ rowsByTimestamp, ...chart }) => ({
      ...chart,
      rows: Array.from(rowsByTimestamp.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    }))
    .sort((a, b) => a.role.localeCompare(b.role) || a.title.localeCompare(b.title))
})

const interfaceSections = computed(() => [
  {
    role: 'uplink' as const,
    title: 'NetFlow: uplinki',
    description: 'Interfejsy wykryte z aktywnej trasy domyślnej',
    charts: interfaceCharts.value.filter(chart => chart.role === 'uplink')
  },
  {
    role: 'dhcp' as const,
    title: 'NetFlow: porty bridge DHCP',
    description: 'Porty dodane do bridge, na których działają serwery DHCP',
    charts: interfaceCharts.value.filter(chart => chart.role === 'dhcp')
  }
])

// ── SNMP Queue charts ───────────────────────────────────────────────────

interface QueueChart {
  key: string
  equipmentId: string
  queueName: string
  rows: SnmpQueuePoint[]
  totalBytesIn: number
  totalBytesOut: number
  totalDroppedIn: number
  totalDroppedOut: number
}

const queueCharts = computed<QueueChart[]>(() => {
  const map = new Map<string, SnmpQueuePoint[]>()
  for (const point of snmpQueues.value) {
    const key = `${point.equipmentId}|${point.queueName}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(point)
  }
  return Array.from(map.entries())
    .map(([key, rows]) => {
      const sep = key.indexOf('|')
      const equipmentId = sep >= 0 ? key.slice(0, sep) : ''
      const queueName = sep >= 0 ? key.slice(sep + 1) : key
      const sorted = rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      return {
        key,
        equipmentId,
        queueName,
        rows: sorted,
        totalBytesIn: sorted.reduce((s, r) => s + r.bytesIn, 0),
        totalBytesOut: sorted.reduce((s, r) => s + r.bytesOut, 0),
        totalDroppedIn: sorted.reduce((s, r) => s + r.droppedIn, 0),
        totalDroppedOut: sorted.reduce((s, r) => s + r.droppedOut, 0)
      }
    })
    .sort((a, b) => a.queueName.localeCompare(b.queueName))
})

const queueX = (_: SnmpQueuePoint, i: number) => i
const queueBytesInY = (row: SnmpQueuePoint) => row.bytesIn
const queueBytesOutY = (row: SnmpQueuePoint) => row.bytesOut
const queueDroppedInY = (row: SnmpQueuePoint) => row.droppedIn
const queueDroppedOutY = (row: SnmpQueuePoint) => row.droppedOut

function queueTicks(rows: SnmpQueuePoint[], i: number) {
  const row = rows[i]
  if (!row || (i !== 0 && i !== rows.length - 1 && i % 3 !== 0)) return ''
  return format(new Date(row.timestamp), 'dd.MM HH:mm')
}

function queueTemplate(chart: QueueChart, row: SnmpQueuePoint) {
  return [
    format(new Date(row.timestamp), 'dd.MM HH:mm'),
    `DL: ${formatBytes(row.bytesIn)} (rzucone ${formatBytes(row.droppedIn)})`,
    `UL: ${formatBytes(row.bytesOut)} (rzucone ${formatBytes(row.droppedOut)})`
  ].join('<br>')
}

// ── SNMP System resources ───────────────────────────────────────────────

interface SystemChartRow {
  timestamp: string
  cpuLoad: number | null
  temperature: number | null
}

interface SystemResourceChart {
  equipmentId: string
  boardName: string | null
  version: string | null
  cpuRows: SystemChartRow[]
}

const systemCharts = computed<SystemResourceChart[]>(() => {
  const byEquipment = new Map<string, SnmpSystemPoint[]>()
  for (const point of snmpSystem.value) {
    if (!byEquipment.has(point.equipmentId)) byEquipment.set(point.equipmentId, [])
    byEquipment.get(point.equipmentId)!.push(point)
  }
  return Array.from(byEquipment.entries())
    .map(([equipmentId, points]) => {
      const sorted = points.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      const first = sorted[0]
      return {
        equipmentId,
        boardName: first?.boardName || null,
        version: first?.version || null,
        cpuRows: sorted.map(p => ({
          timestamp: p.timestamp,
          cpuLoad: p.cpuLoad,
          temperature: p.temperature
        }))
      }
    })
    .sort((a, b) => (a.boardName || '').localeCompare(b.boardName || ''))
})

const systemX = (_: SystemChartRow, i: number) => i
const systemCpuY = (row: SystemChartRow) => row.cpuLoad ?? 0
const systemTempY = (row: SystemChartRow) => row.temperature ?? 0

function systemTicks(rows: SystemChartRow[], i: number) {
  const row = rows[i]
  if (!row || (i !== 0 && i !== rows.length - 1 && i % 3 !== 0)) return ''
  return format(new Date(row.timestamp), 'dd.MM HH:mm')
}

function systemTemplate(chart: SystemResourceChart, row: SystemChartRow) {
  return [
    format(new Date(row.timestamp), 'dd.MM HH:mm'),
    row.cpuLoad != null ? `CPU: ${row.cpuLoad}%` : '',
    row.temperature != null ? `Temp: ${row.temperature}°C` : ''
  ].filter(Boolean).join('<br>')
}

const interfaceX = (_: InterfaceChartRow, i: number) => i
const interfaceRxY = (chart: InterfaceChart) => (row: InterfaceChartRow) =>
  chart.speedBps ? row.rxUtilizationPct || 0 : row.rxBps
const interfaceTxY = (chart: InterfaceChart) => (row: InterfaceChartRow) =>
  chart.speedBps ? row.txUtilizationPct || 0 : row.txBps

function interfaceTicks(rows: InterfaceChartRow[], i: number) {
  const row = rows[i]
  if (!row || (i !== 0 && i !== rows.length - 1 && i % 4 !== 0)) return ''
  return formatTimestamp(row.timestamp)
}

function interfaceYTick(chart: InterfaceChart, value: number) {
  return chart.speedBps ? `${Math.round(value)}%` : formatBps(value)
}

function interfaceTemplate(chart: InterfaceChart, row: InterfaceChartRow) {
  return [
    formatTimestamp(row.timestamp),
    `RX: ${chart.speedBps ? formatPercent(row.rxUtilizationPct) : formatBps(row.rxBps)}`,
    `TX: ${chart.speedBps ? formatPercent(row.txUtilizationPct) : formatBps(row.txBps)}`
  ].join('<br>')
}

interface ActiveUsersChartRow {
  timestamp: string
  count: number
  left: number
  joined: number
}

const activeUserScopeItems = [
  { label: 'Razem', value: 'total' },
  { label: 'Router', value: 'equipment' },
  { label: 'DHCP', value: 'dhcp-server' },
  { label: 'Interfejs', value: 'interface' }
]

const activeUserTargets = computed(() => {
  if (activeUserScope.value === 'total') return [{ label: 'Wszyscy', value: 'all' }]
  const targets = new Map<string, string>()
  for (const point of activeUsers.value) {
    if (point.scope !== activeUserScope.value) continue
    targets.set(point.key, point.label)
  }
  return Array.from(targets.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ label, value }))
})

watch(activeUserScope, () => {
  activeUserTarget.value = 'all'
})

const activeUsersChartRows = computed<ActiveUsersChartRow[]>(() => {
  const rows = new Map<string, ActiveUsersChartRow>()
  const points = activeUsers.value.filter((point) => {
    if (activeUserScope.value === 'total') return point.scope === 'total'
    return point.scope === activeUserScope.value && point.key === activeUserTarget.value
  })

  for (const point of points) {
    const row = rows.get(point.timestamp) || { timestamp: point.timestamp, count: 0, left: 0, joined: 0 }
    row.count += point.count
    row.left += point.left
    row.joined += point.joined
    rows.set(point.timestamp, row)
  }

  return Array.from(rows.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
})

const activeUsersX = (_: ActiveUsersChartRow, i: number) => i
const activeUsersY = (row: ActiveUsersChartRow) => row.count
const activeUsersLeftY = (row: ActiveUsersChartRow) => row.left
const activeUsersJoinedY = (row: ActiveUsersChartRow) => row.joined

const activeUsersTicks = (i: number) => {
  const row = activeUsersChartRows.value[i]
  if (!row || (i !== 0 && i !== activeUsersChartRows.value.length - 1 && i % 4 !== 0)) return ''
  return formatTimestamp(row.timestamp)
}

const activeUsersTemplate = (row: ActiveUsersChartRow) =>
  `${formatTimestamp(row.timestamp)}<br>aktywni ${row.count}<br>odpływ ${row.left}<br>przyrost ${row.joined}`
</script>

<template>
  <UCard ref="cardRef" :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            SNMP / NetFlow / GPON RX
          </p>
          <p class="text-3xl text-highlighted font-semibold">
            {{ totals.snmp + totals.netflow + totals.alerts }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="subtle">
            SNMP {{ totals.snmp }}
          </UBadge>
          <UBadge color="info" variant="subtle">
            NetFlow {{ totals.netflow }}
          </UBadge>
          <UBadge :color="totals.alerts ? 'warning' : 'neutral'" variant="subtle">
            Alerty {{ totals.alerts }}
          </UBadge>
        </div>
      </div>
    </template>

    <div v-if="!data.length" class="px-6 py-16">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-chart-no-axes-combined"
        title="Brak próbek telemetrycznych"
        description="Po uruchomieniu diagnostyki SNMP, NetFlow lub odświeżenia GPON RX wykres zacznie pokazywać przebiegi z ostatnich godzin."
      />
    </div>

    <VisXYContainer
      v-else
      :data="data"
      :padding="{ top: 32, left: 24, right: 24 }"
      class="h-96"
      :width="width"
    >
      <VisArea
        :x="x"
        :y="yAlerts"
        color="var(--ui-warning)"
        :opacity="0.12"
      />
      <VisLine :x="x" :y="ySnmp" color="var(--ui-primary)" />
      <VisLine :x="x" :y="yNetflow" color="var(--ui-info)" />
      <VisLine :x="x" :y="yAlerts" color="var(--ui-warning)" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />
      <VisCrosshair color="var(--ui-primary)" :template="template" />
      <VisTooltip />
    </VisXYContainer>
  </UCard>

  <UCard :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            DHCP / ARP / Bridge Host
          </p>
          <p class="text-lg text-highlighted font-semibold">
            Aktywni użytkownicy i odpływ
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <USelect
            v-model="activeUserScope"
            :items="activeUserScopeItems"
            value-key="value"
            label-key="label"
            class="w-36"
          />
          <USelect
            v-if="activeUserScope !== 'total'"
            v-model="activeUserTarget"
            :items="activeUserTargets"
            value-key="value"
            label-key="label"
            class="w-64"
          />
        </div>
      </div>
    </template>

    <div v-if="!activeUsersChartRows.length" class="px-6 py-12">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-users"
        title="Brak próbek aktywnych użytkowników"
        description="Po uruchomieniu pomiaru DHCP active users wykres pokaże liczbę aktywnych MAC oraz odpływ między przebiegami."
      />
    </div>

    <VisXYContainer
      v-else
      :data="activeUsersChartRows"
      :padding="{ top: 24, left: 42, right: 24, bottom: 24 }"
      class="h-72"
    >
      <VisArea
        :x="activeUsersX"
        :y="activeUsersY"
        color="var(--ui-primary)"
        :opacity="0.12"
      />
      <VisLine :x="activeUsersX" :y="activeUsersY" color="var(--ui-primary)" />
      <VisLine :x="activeUsersX" :y="activeUsersLeftY" color="var(--ui-error)" />
      <VisLine :x="activeUsersX" :y="activeUsersJoinedY" color="var(--ui-success)" />
      <VisAxis type="x" :x="activeUsersX" :tick-format="activeUsersTicks" />
      <VisAxis type="y" />
      <VisCrosshair color="var(--ui-primary)" :template="activeUsersTemplate" />
      <VisTooltip />
    </VisXYContainer>
  </UCard>

  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs text-muted uppercase mb-1.5">
              Collector WSL
            </p>
            <p class="text-lg text-highlighted font-semibold">
              Zdrowie exporterów
            </p>
          </div>
          <UBadge :color="collectorHealth.length ? 'success' : 'neutral'" variant="subtle">
            {{ collectorHealth.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="!collectorHealth.length" class="py-4">
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-radio-receiver"
          title="Brak statusu collectora"
          description="Status pojawi się po pierwszym flushu WSL collectora do bazy."
        />
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="health in collectorHealth"
          :key="`${health.exporterAddress}-${health.version}-${health.sourceId}`"
          class="flex flex-wrap items-center justify-between gap-3 border-b border-muted pb-3 last:border-b-0 last:pb-0"
        >
          <div class="min-w-0">
            <p class="text-sm text-highlighted font-medium">
              {{ health.exporterAddress }} / v{{ health.version }}
            </p>
            <p class="text-xs text-muted">
              flows {{ formatFlows(health.flowRecords) }} · seq {{ Math.round(health.lastSequence) }}
            </p>
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <UBadge :color="health.unknownTemplateRecords ? 'warning' : 'neutral'" variant="subtle">
              template {{ Math.round(health.unknownTemplateRecords) }}
            </UBadge>
            <UBadge :color="health.sequenceGaps ? 'warning' : 'neutral'" variant="subtle">
              gaps {{ Math.round(health.sequenceGaps) }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            IPFIX / rollup 1m
          </p>
          <p class="text-lg text-highlighted font-semibold">
            Top użytkownicy
          </p>
        </div>
      </template>

      <div v-if="!topUsers.length" class="py-4">
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-user-search"
          title="Brak zmapowanych flow użytkowników"
          description="Po odebraniu IPFIX z adresami IP/MAC i zgodności z lokalnymi sieciami pojawi się ranking ruchu."
        />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-xs text-muted uppercase">
            <tr>
              <th class="py-2 pr-3 text-left font-medium">
                Użytkownik
              </th>
              <th class="py-2 px-3 text-right font-medium">
                DL
              </th>
              <th class="py-2 px-3 text-right font-medium">
                UL
              </th>
              <th class="py-2 pl-3 text-right font-medium">
                Flow
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in topUsers"
              :key="user.userKey"
              class="border-t border-muted"
            >
              <td class="py-2 pr-3">
                <p class="text-highlighted font-medium">
                  {{ user.label }}
                </p>
                <p class="text-xs text-muted">
                  {{ user.localIp || user.userKey }}
                </p>
              </td>
              <td class="py-2 px-3 text-right text-muted">
                {{ formatBps(user.downloadBps) }}
              </td>
              <td class="py-2 px-3 text-right text-muted">
                {{ formatBps(user.uploadBps) }}
              </td>
              <td class="py-2 pl-3 text-right text-muted">
                {{ formatFlows(user.flows) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>

  <section
    v-for="section in interfaceSections"
    :key="section.role"
    class="space-y-3"
  >
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs text-muted uppercase mb-1">
          {{ section.description }}
        </p>
        <h2 class="text-lg text-highlighted font-semibold">
          {{ section.title }}
        </h2>
      </div>
      <UBadge color="neutral" variant="subtle">
        {{ section.charts.length }} interfejsy
      </UBadge>
    </div>

    <div v-if="!section.charts.length" class="py-2">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-chart-no-axes-combined"
        title="Brak danych per interfejs"
        description="Po odebraniu nowych pakietów NetFlow v9 z template flowset wykres pokaże ruch dla wykrytych interfejsów."
      />
    </div>

    <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="chart in section.charts"
        :key="chart.key"
        :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }"
      >
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs text-muted uppercase mb-1.5">
                {{ chart.subtitle }}
              </p>
              <p class="text-lg text-highlighted font-semibold break-words">
                {{ chart.title }}
              </p>
            </div>
            <div class="flex flex-wrap justify-end gap-2">
              <UBadge :color="chart.color" variant="subtle">
                {{ formatSpeed(chart.speedBps) }}
              </UBadge>
              <UBadge color="neutral" variant="subtle">
                max {{ formatPercent(chart.peakUtilizationPct) }}
              </UBadge>
            </div>
          </div>
        </template>

        <div class="px-6 pb-2 flex flex-wrap gap-2 text-xs text-muted">
          <span>RX {{ chart.speedBps ? '%' : 'bps' }}</span>
          <span>TX {{ chart.speedBps ? '%' : 'bps' }}</span>
          <span>{{ formatBytes(chart.totalBytes) }}</span>
        </div>

        <VisXYContainer
          :data="chart.rows"
          :padding="{ top: 18, left: 42, right: 16, bottom: 22 }"
          class="h-56"
        >
          <VisLine :x="interfaceX" :y="interfaceRxY(chart)" color="var(--ui-primary)" />
          <VisLine :x="interfaceX" :y="interfaceTxY(chart)" color="var(--ui-info)" />
          <VisAxis type="x" :x="interfaceX" :tick-format="(i: number) => interfaceTicks(chart.rows, i)" />
          <VisAxis type="y" :tick-format="(value: number) => interfaceYTick(chart, value)" />
          <VisCrosshair color="var(--ui-primary)" :template="(row: InterfaceChartRow) => interfaceTemplate(chart, row)" />
          <VisTooltip />
        </VisXYContainer>
      </UCard>
    </div>
  </section>

  <!-- ── SNMP Queue charts ────────────────────────────────────────── -->
  <section v-if="queueCharts.length" class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs text-muted uppercase mb-1">
          Kolejki SNMP z urządzeń MikroTik
        </p>
        <h2 class="text-lg text-highlighted font-semibold">
          Kolejki proste
        </h2>
      </div>
      <UBadge color="neutral" variant="subtle">
        {{ queueCharts.length }} kolejek
      </UBadge>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="chart in queueCharts"
        :key="chart.key"
        :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }"
      >
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs text-muted uppercase mb-1.5">
                {{ chart.equipmentId || 'SNMP' }}
              </p>
              <p class="text-lg text-highlighted font-semibold break-words">
                {{ chart.queueName }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge color="primary" variant="subtle">
                DL {{ formatBytes(chart.totalBytesIn) }}
              </UBadge>
              <UBadge color="info" variant="subtle">
                UL {{ formatBytes(chart.totalBytesOut) }}
              </UBadge>
            </div>
          </div>
        </template>

        <div class="px-6 pb-2 flex flex-wrap gap-3 text-xs text-muted">
          <span>pobrano</span>
          <span>wysłano</span>
          <span>rzucone DL {{ formatBytes(chart.totalDroppedIn) }}</span>
          <span>rzucone UL {{ formatBytes(chart.totalDroppedOut) }}</span>
        </div>

        <VisXYContainer
          :data="chart.rows"
          :padding="{ top: 18, left: 42, right: 16, bottom: 22 }"
          class="h-56"
        >
          <VisLine :x="queueX" :y="queueBytesInY" color="var(--ui-primary)" />
          <VisLine :x="queueX" :y="queueBytesOutY" color="var(--ui-info)" />
          <VisArea
            :x="queueX"
            :y="queueDroppedInY"
            color="var(--ui-error)"
            :opacity="0.12"
          />
          <VisArea
            :x="queueX"
            :y="queueDroppedOutY"
            color="var(--ui-warning)"
            :opacity="0.12"
          />
          <VisAxis type="x" :x="queueX" :tick-format="(i: number) => queueTicks(chart.rows, i)" />
          <VisAxis type="y" :tick-format="formatBps" />
          <VisCrosshair color="var(--ui-primary)" :template="(row: SnmpQueuePoint) => queueTemplate(chart, row)" />
          <VisTooltip />
        </VisXYContainer>
      </UCard>
    </div>
  </section>

  <div v-else class="py-2">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-chart-no-axes-combined"
      title="Brak danych kolejek SNMP"
      description="Po wykonaniu diagnostyki SNMP na urządzeniu MikroTik wykresy kolejek pojawią się automatycznie."
    />
  </div>

  <!-- ── SNMP System resources ────────────────────────────────────── -->
  <section v-if="systemCharts.length" class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs text-muted uppercase mb-1">
          Zasoby systemowe z SNMP
        </p>
        <h2 class="text-lg text-highlighted font-semibold">
          CPU / temperatura
        </h2>
      </div>
      <UBadge color="neutral" variant="subtle">
        {{ systemCharts.length }} urządzeń
      </UBadge>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="chart in systemCharts"
        :key="chart.equipmentId"
        :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }"
      >
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs text-muted uppercase mb-1.5">
                {{ chart.boardName || chart.equipmentId || 'SNMP' }}
              </p>
              <p class="text-lg text-highlighted font-semibold">
                CPU i temperatura
              </p>
            </div>
            <UBadge v-if="chart.version" color="neutral" variant="subtle">
              v{{ chart.version }}
            </UBadge>
          </div>
        </template>

        <VisXYContainer
          :data="chart.cpuRows"
          :padding="{ top: 18, left: 42, right: 16, bottom: 22 }"
          class="h-56"
        >
          <VisLine :x="systemX" :y="systemCpuY" color="var(--ui-primary)" />
          <VisLine :x="systemX" :y="systemTempY" color="var(--ui-warning)" />
          <VisAxis type="x" :x="systemX" :tick-format="(i: number) => systemTicks(chart.cpuRows, i)" />
          <VisAxis type="y" />
          <VisCrosshair color="var(--ui-primary)" :template="(row: SystemChartRow) => systemTemplate(chart, row)" />
          <VisTooltip />
        </VisXYContainer>
      </UCard>
    </div>
  </section>

  <div v-else class="py-2">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-chart-no-axes-combined"
      title="Brak danych zasobów SNMP"
      description="Po wykonaniu diagnostyki SNMP na urządzeniu MikroTik wykresy CPU/temperatury pojawią się automatycznie."
    />
  </div>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>

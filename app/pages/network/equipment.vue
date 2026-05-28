<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface EquipmentRow {
  id: string
  inventoryId: string
  equipmentRole: string
  hostname?: string | null
  managementIp?: string | null
  managementPort?: number | null
  managementProtocol?: string | null
  accessProfile?: { id: number, name: string } | null
  managementDriver?: { id: number, label: string, code: string } | null
  parentEquipment?: { id: string, inventoryId: string, hostname?: string | null } | null
  bridgeMode: boolean
  onuPort?: string | null
  onuId?: string | null
  macAddress?: string | null
  serialNumber?: string | null
  status: string
  model: { id: number, manufacturer: string, modelName: string, technology?: { label: string } | null }
  node?: { id: string, name: string } | null
  profileBindings?: Array<{ profile: { name: string } }>
}

interface OptionsResponse {
  success: boolean
  data: {
    models: Array<{ id: number, manufacturer: string, modelName: string }>
    nodes: Array<{ id: string, name: string }>
    profiles: Array<{ id: number, name: string }>
    drivers: Array<{ id: number, label: string, code: string }>
    equipment: Array<{ id: string, inventoryId: string, hostname?: string | null }>
  }
}

const toast = useToast()
const role = ref('all')
const equipmentOpen = ref(false)
const detailsOpen = ref(false)
const diagnosticOpen = ref(false)
const selectedRow = ref<EquipmentRow | null>(null)
const editingEquipmentId = ref<string | null>(null)
const diagnosticResult = ref<unknown>(null)
const diagnosticLoading = ref('')
const diagnosticMac = ref('')
const diagnosticIp = ref('')
const diagnosticOltPort = ref('1')
const diagnosticOnuId = ref('')

function confirmRestart() {
  if (!selectedRow.value) return
  if (!window.confirm(`Czy na pewno zrestartować urządzenie ${selectedRow.value.inventoryId}?\nTo spowoduje przerwanie usług dla klientów na tym urządzeniu.`)) return
  runEquipmentDiagnostic('restart')
}

const equipmentSchema = z.object({
  inventoryId: z.string().min(1),
  modelId: z.number().int().positive(),
  nodeId: z.string().uuid().optional().nullable(),
  accessProfileId: z.number().int().positive().optional().nullable(),
  managementDriverId: z.number().int().positive().optional().nullable(),
  parentEquipmentId: z.string().uuid().optional().nullable(),
  hostname: z.string().optional(),
  managementIp: z.string().optional(),
  managementPort: z.number().int().positive().max(65535).optional().nullable(),
  managementProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf']).optional(),
  macAddress: z.string().optional(),
  serialNumber: z.string().optional(),
  loginUrl: z.string().optional(),
  equipmentRole: z.enum(['BACKBONE', 'CLIENT_PE']),
  bridgeMode: z.boolean(),
  onuPort: z.string().optional(),
  onuId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['IN_USE', 'SPARE', 'FAILED', 'DECOMMISSIONED'])
})

type EquipmentSchema = z.output<typeof equipmentSchema>

const equipmentState = reactive<Partial<EquipmentSchema>>({
  equipmentRole: 'CLIENT_PE',
  managementProtocol: 'ssh',
  managementPort: 22,
  bridgeMode: false,
  status: 'IN_USE'
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: EquipmentRow[] }>('/api/network/equipment', {
  query: computed(() => role.value === 'all' ? {} : { role: role.value }),
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { models: [], nodes: [], profiles: [], drivers: [], equipment: [] } })
})

const modelItems = computed(() => options.value.data.models.map(model => ({
  label: `${model.manufacturer} ${model.modelName}`,
  value: model.id
})))
const nodeItems = computed(() => [
  { label: 'Bez węzła', value: null },
  ...options.value.data.nodes.map(node => ({ label: node.name, value: node.id }))
])
const profileItems = computed(() => [
  { label: 'Bez profilu', value: null },
  ...options.value.data.profiles.map(profile => ({ label: profile.name, value: profile.id }))
])
const driverItems = computed(() => [
  { label: 'Mock / brak drivera', value: null },
  ...options.value.data.drivers.map(driver => ({ label: `${driver.label} (${driver.code})`, value: driver.id }))
])
const parentItems = computed(() => [
  { label: 'Bez nadrzędnego', value: null },
  ...options.value.data.equipment.map(equipment => ({
    label: [equipment.inventoryId, equipment.hostname].filter(Boolean).join(' - '),
    value: equipment.id
  }))
])

const columns: TableColumn<EquipmentRow>[] = [
  { accessorKey: 'inventoryId', header: 'ID' },
  {
    id: 'model',
    header: 'Model',
    cell: ({ row }) => `${row.original.model.manufacturer} ${row.original.model.modelName}`
  },
  { accessorKey: 'hostname', header: 'Hostname' },
  { accessorKey: 'managementIp', header: 'IP zarządzania' },
  {
    id: 'management',
    header: 'Protokół',
    cell: ({ row }) => [row.original.managementProtocol, row.original.managementPort].filter(Boolean).join(':') || 'Brak'
  },
  {
    id: 'driver',
    header: 'Driver',
    cell: ({ row }) => row.original.managementDriver?.code || 'mock'
  },
  {
    id: 'profile',
    header: 'Profil',
    cell: ({ row }) => row.original.accessProfile?.name || 'Brak'
  },
  { accessorKey: 'equipmentRole', header: 'Rola' },
  { accessorKey: 'node.name', header: 'Węzeł zasilający' },
  {
    id: 'profiles',
    header: 'Profile',
    cell: ({ row }) => row.original.profileBindings?.map(binding => binding.profile.name).join(', ') || 'Brak'
  },
  {
    id: 'parent',
    header: 'Nadrzędne/ONU',
    cell: ({ row }) => row.original.parentEquipment?.inventoryId || [row.original.onuPort, row.original.onuId].filter(Boolean).join('/') || 'Brak'
  },
  { accessorKey: 'status', header: 'Status' }
]

function resetEquipmentForm() {
  editingEquipmentId.value = null
  selectedRow.value = null
  Object.assign(equipmentState, {
    inventoryId: undefined,
    modelId: undefined,
    nodeId: null,
    accessProfileId: null,
    managementDriverId: null,
    parentEquipmentId: null,
    hostname: undefined,
    managementIp: undefined,
    managementPort: 22,
    managementProtocol: 'ssh',
    macAddress: undefined,
    serialNumber: undefined,
    loginUrl: undefined,
    equipmentRole: 'CLIENT_PE',
    bridgeMode: false,
    onuPort: undefined,
    onuId: undefined,
    notes: undefined,
    status: 'IN_USE'
  })
}

function openCreateEquipment() {
  resetEquipmentForm()
  equipmentOpen.value = true
}

function openEditEquipment(row: EquipmentRow) {
  selectedRow.value = row
  editingEquipmentId.value = row.id
  Object.assign(equipmentState, {
    inventoryId: row.inventoryId,
    modelId: row.model.id,
    nodeId: row.node?.id || null,
    accessProfileId: row.accessProfile?.id || null,
    managementDriverId: row.managementDriver?.id || null,
    parentEquipmentId: row.parentEquipment?.id || null,
    hostname: row.hostname || undefined,
    managementIp: row.managementIp || undefined,
    managementPort: row.managementPort || undefined,
    managementProtocol: (row.managementProtocol || 'ssh') as EquipmentSchema['managementProtocol'],
    macAddress: row.macAddress || undefined,
    serialNumber: row.serialNumber || undefined,
    equipmentRole: row.equipmentRole as EquipmentSchema['equipmentRole'],
    bridgeMode: row.bridgeMode,
    onuPort: row.onuPort || undefined,
    onuId: row.onuId || undefined,
    status: row.status as EquipmentSchema['status']
  })
  equipmentOpen.value = true
}

async function saveEquipment(event: FormSubmitEvent<EquipmentSchema>) {
  await $fetch(editingEquipmentId.value ? `/api/network/equipment/${editingEquipmentId.value}` : '/api/network/equipment', {
    method: editingEquipmentId.value ? 'PATCH' : 'POST',
    body: {
      ...event.data,
      hostname: event.data.hostname || null,
      managementIp: event.data.managementIp || null,
      accessProfileId: event.data.accessProfileId || null,
      managementDriverId: event.data.managementDriverId || null,
      parentEquipmentId: event.data.parentEquipmentId || null,
      macAddress: event.data.macAddress || null,
      serialNumber: event.data.serialNumber || null,
      loginUrl: event.data.loginUrl || null,
      onuPort: event.data.onuPort || null,
      onuId: event.data.onuId || null,
      notes: event.data.notes || null
    }
  })
  toast.add({ title: 'Urządzenie zapisane', color: 'success' })
  equipmentOpen.value = false
  resetEquipmentForm()
  await refresh()
}

async function deleteEquipment(row: EquipmentRow) {
  if (!window.confirm(`Usunąć urządzenie ${row.inventoryId}?`)) return
  await $fetch(`/api/network/equipment/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Urządzenie usunięte', color: 'success' })
  await refresh()
}

function showDetails(row: EquipmentRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function showDiagnostics(row: EquipmentRow) {
  selectedRow.value = row
  diagnosticResult.value = null
  diagnosticMac.value = row.macAddress || ''
  diagnosticIp.value = row.managementIp || ''
  diagnosticOltPort.value = row.onuPort || '1'
  diagnosticOnuId.value = row.onuId || ''
  diagnosticOpen.value = true
}

async function runEquipmentDiagnostic(action: 'mikrotik-check' | 'mac-check' | 'command-tree' | 'onu-ip-host' | 'netflow-config' | 'restart') {
  if (!selectedRow.value) return
  if (action === 'mac-check' && !diagnosticMac.value) {
    toast.add({ title: 'Podaj MAC', color: 'warning' })
    return
  }
  if (action === 'onu-ip-host' && (!diagnosticOltPort.value || !diagnosticOnuId.value)) {
    toast.add({ title: 'Podaj port OLT i ONU ID', color: 'warning' })
    return
  }

  diagnosticLoading.value = action
  try {
    const body = action === 'mikrotik-check'
      ? { macAddress: diagnosticMac.value || null, ipAddress: diagnosticIp.value || null }
      : action === 'mac-check'
        ? { macAddress: diagnosticMac.value }
        : action === 'onu-ip-host'
          ? { oltPort: diagnosticOltPort.value, onuId: diagnosticOnuId.value }
          : action === 'netflow-config'
            ? { collector: '10.0.222.226:2055' }
            : undefined

    diagnosticResult.value = await $fetch(`/api/diagnostics/equipment/${selectedRow.value.id}/${action}`, {
      method: 'POST',
      body
    })
  } catch (error) {
    toast.add({ title: 'Diagnostyka nie powiodła się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    diagnosticLoading.value = ''
  }
}

function rowContextItems(row: EquipmentRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj urządzenie', icon: 'i-lucide-pencil', onSelect: () => openEditEquipment(row) },
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Diagnostyka live', icon: 'i-lucide-activity', onSelect: () => showDiagnostics(row) },
    { label: 'Włącz NetFlow', icon: 'i-lucide-chart-network', onSelect: () => {
      showDiagnostics(row)
      runEquipmentDiagnostic('netflow-config')
    } }
  ], [
    { label: 'Usuń urządzenie', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteEquipment(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-equipment" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Urządzenia">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="equipmentOpen" :title="editingEquipmentId ? 'Edytuj urządzenie' : 'Dodaj urządzenie'">
            <UButton label="Dodaj urządzenie" icon="i-lucide-server-cog" @click="openCreateEquipment" />
            <template #body>
              <UForm
                :schema="equipmentSchema"
                :state="equipmentState"
                class="space-y-4"
                @submit="saveEquipment"
              >
                <UFormField label="ID inwentarzowe" name="inventoryId" required>
                  <UInput v-model="equipmentState.inventoryId" class="w-full" />
                </UFormField>
                <UFormField label="Model" name="modelId" required>
                  <USelect v-model="equipmentState.modelId" :items="modelItems" class="w-full" />
                </UFormField>
                <UFormField label="Węzeł zasilający" name="nodeId">
                  <USelect v-model="equipmentState.nodeId" :items="nodeItems" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Profil dostępu" name="accessProfileId">
                    <USelect v-model="equipmentState.accessProfileId" :items="profileItems" class="w-full" />
                  </UFormField>
                  <UFormField label="Driver backendu" name="managementDriverId">
                    <USelect v-model="equipmentState.managementDriverId" :items="driverItems" class="w-full" />
                  </UFormField>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Hostname" name="hostname">
                    <UInput v-model="equipmentState.hostname" class="w-full" />
                  </UFormField>
                  <UFormField label="IP zarządzania" name="managementIp">
                    <UInput v-model="equipmentState.managementIp" class="w-full" />
                  </UFormField>
                  <UFormField label="Protokół" name="managementProtocol">
                    <USelect
                      v-model="equipmentState.managementProtocol"
                      :items="['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf']"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Port" name="managementPort">
                    <UInputNumber v-model="equipmentState.managementPort" class="w-full" />
                  </UFormField>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="MAC" name="macAddress">
                    <UInput v-model="equipmentState.macAddress" class="w-full" />
                  </UFormField>
                  <UFormField label="Numer seryjny" name="serialNumber">
                    <UInput v-model="equipmentState.serialNumber" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Rola" name="equipmentRole">
                  <USelect v-model="equipmentState.equipmentRole" :items="['BACKBONE', 'CLIENT_PE']" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Urządzenie nadrzędne / ONU" name="parentEquipmentId">
                    <USelect v-model="equipmentState.parentEquipmentId" :items="parentItems" class="w-full" />
                  </UFormField>
                  <UFormField label="Tryb bridge za ONU" name="bridgeMode">
                    <USwitch v-model="equipmentState.bridgeMode" />
                  </UFormField>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Port OLT" name="onuPort">
                    <UInput v-model="equipmentState.onuPort" class="w-full" />
                  </UFormField>
                  <UFormField label="ONU ID" name="onuId">
                    <UInput v-model="equipmentState.onuId" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Login URL" name="loginUrl">
                  <UInput v-model="equipmentState.loginUrl" class="w-full" />
                </UFormField>
                <UFormField label="Notatki" name="notes">
                  <UTextarea v-model="equipmentState.notes" class="w-full" />
                </UFormField>
                <UFormField label="Status" name="status">
                  <USelect
                    v-model="equipmentState.status"
                    :items="['IN_USE', 'SPARE', 'FAILED', 'DECOMMISSIONED']"
                    class="w-full"
                  />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <USelect
            v-model="role"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Szkielet', value: 'BACKBONE' },
              { label: 'CPE / PE', value: 'CLIENT_PE' }
            ]"
            class="min-w-40"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <AppDataTable
        :data="data.data"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły urządzenia"
        :subtitle="selectedRow?.inventoryId"
        :item="selectedRow"
      />
      <USlideover
        v-model:open="diagnosticOpen"
        title="Diagnostyka urządzenia"
        :description="selectedRow ? `${selectedRow.inventoryId} / ${selectedRow.managementDriver?.code || 'mock'}` : undefined"
      >
        <template #body>
          <div class="space-y-4">
            <div class="grid gap-3 md:grid-cols-2">
              <UFormField label="MAC">
                <UInput v-model="diagnosticMac" class="w-full" />
              </UFormField>
              <UFormField label="IP">
                <UInput v-model="diagnosticIp" class="w-full" />
              </UFormField>
              <UFormField label="Port OLT">
                <UInput v-model="diagnosticOltPort" class="w-full" />
              </UFormField>
              <UFormField label="ONU ID">
                <UInput v-model="diagnosticOnuId" class="w-full" />
              </UFormField>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <UButton
                label="MikroTik DHCP/Ping/ARP"
                icon="i-lucide-radar"
                :loading="diagnosticLoading === 'mikrotik-check'"
                @click="runEquipmentDiagnostic('mikrotik-check')"
              />
              <UButton
                label="MAC lookup"
                icon="i-lucide-search"
                variant="subtle"
                :loading="diagnosticLoading === 'mac-check'"
                @click="runEquipmentDiagnostic('mac-check')"
              />
              <UButton
                label="ONU IP-host"
                icon="i-lucide-router"
                variant="subtle"
                :loading="diagnosticLoading === 'onu-ip-host'"
                @click="runEquipmentDiagnostic('onu-ip-host')"
              />
              <UButton
                label="Command tree"
                icon="i-lucide-terminal"
                variant="subtle"
                :loading="diagnosticLoading === 'command-tree'"
                @click="runEquipmentDiagnostic('command-tree')"
              />
              <UButton
                label="Włącz NetFlow"
                icon="i-lucide-chart-network"
                variant="subtle"
                :loading="diagnosticLoading === 'netflow-config'"
                @click="runEquipmentDiagnostic('netflow-config')"
              />
              <UButton
                label="Restart"
                icon="i-lucide-power"
                color="error"
                variant="subtle"
                :loading="diagnosticLoading === 'restart'"
                @click="confirmRestart"
              />
            </div>
            <AppDiagnosticResult :result="diagnosticResult" />
          </div>
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

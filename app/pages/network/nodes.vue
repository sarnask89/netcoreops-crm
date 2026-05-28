<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface NodeRow {
  id: string
  inventoryId: string
  name: string
  nodeType: string
  status: string
  medium?: { label: string } | null
  street?: { streetType?: string | null, name: string } | null
  simcLocality?: { name: string } | null
  buildingNumber?: string | null
}

interface OptionsResponse {
  success: boolean
  data: {
    media: Array<{ code: string, label: string }>
  }
}

const toast = useToast()
const open = ref(false)
const detailsOpen = ref(false)
const selectedRow = ref<NodeRow | null>(null)
const editingNodeId = ref<string | null>(null)
const addressInput = ref('')
const selectedAddress = ref<{ terytCode: string, simcCode: string, ulicCode: string } | null>(null)

const schema = z.object({
  inventoryId: z.string().min(1),
  name: z.string().min(1),
  nodeType: z.enum(['SZKIELETOWY', 'DYSTRYBUCYJNY']),
  mediumCode: z.string().optional(),
  buildingNumber: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  nodeType: 'DYSTRYBUCYJNY',
  mediumCode: 'FO',
  status: 'PLANNED'
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: NodeRow[] }>('/api/network/nodes', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { media: [] } })
})

const rows = computed(() => data.value.data)
const mediaItems = computed(() => options.value.data.media.map(item => ({
  label: item.label,
  value: item.code
})))

const columns: TableColumn<NodeRow>[] = [
  { accessorKey: 'inventoryId', header: 'ID' },
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'nodeType', header: 'Typ' },
  { accessorKey: 'medium.label', header: 'Medium' },
  {
    id: 'address',
    header: 'Adres',
    cell: ({ row }) => formatAddress(row.original)
  },
  { accessorKey: 'status', header: 'Status' }
]

function resetForm() {
  editingNodeId.value = null
  selectedRow.value = null
  selectedAddress.value = null
  addressInput.value = ''
  Object.assign(state, {
    inventoryId: undefined,
    name: undefined,
    nodeType: 'DYSTRYBUCYJNY',
    mediumCode: 'FO',
    buildingNumber: undefined,
    status: 'PLANNED'
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: NodeRow) {
  selectedRow.value = row
  editingNodeId.value = row.id
  selectedAddress.value = null
  addressInput.value = formatAddress(row)
  Object.assign(state, {
    inventoryId: row.inventoryId,
    name: row.name,
    nodeType: row.nodeType as Schema['nodeType'],
    mediumCode: undefined,
    buildingNumber: row.buildingNumber || undefined,
    status: row.status as Schema['status']
  })
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch(editingNodeId.value ? `/api/network/nodes/${editingNodeId.value}` : '/api/network/nodes', {
    method: editingNodeId.value ? 'PATCH' : 'POST',
    body: {
      ...event.data,
      address: selectedAddress.value
        ? { ...selectedAddress.value, buildingNumber: event.data.buildingNumber }
        : editingNodeId.value ? undefined : null
    }
  })
  toast.add({ title: 'Węzeł zapisany', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deleteNode(row: NodeRow) {
  if (!window.confirm(`Usunąć węzeł ${row.inventoryId}?`)) return
  await $fetch(`/api/network/nodes/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Węzeł usunięty', color: 'success' })
  await refresh()
}

function showDetails(row: NodeRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: NodeRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj węzeł', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Pokaż w topologii', icon: 'i-lucide-network', onSelect: () => navigateTo(`/network/topology/${row.id}`) },
    { label: 'Usuń węzeł', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteNode(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-nodes" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Węzły sieci">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="open" :title="editingNodeId ? 'Edytuj węzeł' : 'Dodaj węzeł'">
            <UButton label="Dodaj węzeł" icon="i-lucide-plus" @click="openCreate" />
            <template #body>
              <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
              >
                <UFormField label="ID inwentarzowy" name="inventoryId" required>
                  <UInput v-model="state.inventoryId" class="w-full" />
                </UFormField>
                <UFormField label="Nazwa" name="name" required>
                  <UInput v-model="state.name" class="w-full" />
                </UFormField>
                <UFormField label="Typ" name="nodeType" required>
                  <USelect v-model="state.nodeType" :items="['SZKIELETOWY', 'DYSTRYBUCYJNY']" class="w-full" />
                </UFormField>
                <UFormField label="Medium" name="mediumCode">
                  <USelect v-model="state.mediumCode" :items="mediaItems" class="w-full" />
                </UFormField>
                <UFormField label="Adres z definicji">
                  <AddressAutocomplete
                    v-model="addressInput"
                    @update:model-value="selectedAddress = null"
                    @select="selectedAddress = $event"
                  />
                </UFormField>
                <UFormField label="Nr budynku" name="buildingNumber">
                  <UInput v-model="state.buildingNumber" class="w-full" />
                </UFormField>
                <UFormField label="Status" name="status">
                  <USelect v-model="state.status" :items="['PLANNED', 'ACTIVE', 'DECOMMISSIONED']" class="w-full" />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>
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
        title="Szczegóły węzła"
        :subtitle="selectedRow?.inventoryId"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface LineRow {
  id: string
  inventoryId: string
  status: string
  fiberCount?: number | null
  lengthMeters?: number | null
  medium?: { label: string } | null
  startNode: { id: string, name: string }
  endNode: { id: string, name: string }
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
const selectedRow = ref<LineRow | null>(null)
const editingLineId = ref<string | null>(null)
const lineSchema = z.object({
  inventoryId: z.string().min(1),
  nodeStartId: z.string().uuid(),
  nodeEndId: z.string().uuid(),
  mediumCode: z.string().optional(),
  fiberCount: z.number().int().nonnegative().nullable().optional(),
  lengthMeters: z.number().nonnegative().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED'])
})
type LineSchema = z.output<typeof lineSchema>
const lineState = reactive<Partial<LineSchema>>({
  status: 'ACTIVE',
  mediumCode: 'FO'
})
const { data, status, refresh } = await useFetch<{ success: boolean, data: LineRow[] }>('/api/network/lines', {
  default: () => ({ success: false, data: [] })
})
const { data: nodes } = await useFetch<{ success: boolean, data: Array<{ id: string, name: string, inventoryId: string }> }>('/api/network/nodes', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { media: [] } })
})
const nodeItems = computed(() => nodes.value.data.map(node => ({
  label: `${node.inventoryId} - ${node.name}`,
  value: node.id
})))
const mediaItems = computed(() => options.value.data.media.map(item => ({
  label: item.label,
  value: item.code
})))

const columns: TableColumn<LineRow>[] = [
  { accessorKey: 'inventoryId', header: 'ID' },
  { accessorKey: 'startNode.name', header: 'Początek' },
  { accessorKey: 'endNode.name', header: 'Koniec' },
  { accessorKey: 'medium.label', header: 'Medium' },
  { accessorKey: 'fiberCount', header: 'Włókna' },
  { accessorKey: 'lengthMeters', header: 'Metry' },
  { accessorKey: 'status', header: 'Status' }
]

function showDetails(row: LineRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function resetForm() {
  editingLineId.value = null
  selectedRow.value = null
  Object.assign(lineState, {
    inventoryId: undefined,
    nodeStartId: undefined,
    nodeEndId: undefined,
    mediumCode: 'FO',
    fiberCount: undefined,
    lengthMeters: undefined,
    status: 'ACTIVE'
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: LineRow) {
  selectedRow.value = row
  editingLineId.value = row.id
  Object.assign(lineState, {
    inventoryId: row.inventoryId,
    nodeStartId: row.startNode.id,
    nodeEndId: row.endNode.id,
    mediumCode: undefined,
    fiberCount: row.fiberCount ?? undefined,
    lengthMeters: row.lengthMeters ?? undefined,
    status: row.status as LineSchema['status']
  })
  open.value = true
}

async function saveLine(event: FormSubmitEvent<LineSchema>) {
  await $fetch(editingLineId.value ? `/api/network/lines/${editingLineId.value}` : '/api/network/lines', {
    method: editingLineId.value ? 'PATCH' : 'POST',
    body: event.data
  })
  toast.add({ title: 'Linia zapisana', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deleteLine(row: LineRow) {
  if (!window.confirm(`Usunąć linię ${row.inventoryId}?`)) return
  await $fetch(`/api/network/lines/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Linia usunięta', color: 'success' })
  await refresh()
}

function rowContextItems(row: LineRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj linię', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Usuń linię', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteLine(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-lines" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Linie sieciowe">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="open" :title="editingLineId ? 'Edytuj linię' : 'Dodaj linię'">
            <UButton label="Dodaj linię" icon="i-lucide-plus" @click="openCreate" />
            <template #body>
              <UForm
                :schema="lineSchema"
                :state="lineState"
                class="space-y-4"
                @submit="saveLine"
              >
                <UFormField label="ID inwentarzowy" name="inventoryId" required>
                  <UInput v-model="lineState.inventoryId" class="w-full" />
                </UFormField>
                <UFormField label="Węzeł początkowy" name="nodeStartId" required>
                  <USelect v-model="lineState.nodeStartId" :items="nodeItems" class="w-full" />
                </UFormField>
                <UFormField label="Węzeł końcowy" name="nodeEndId" required>
                  <USelect v-model="lineState.nodeEndId" :items="nodeItems" class="w-full" />
                </UFormField>
                <UFormField label="Medium" name="mediumCode">
                  <USelect v-model="lineState.mediumCode" :items="mediaItems" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Liczba włókien" name="fiberCount">
                    <UInputNumber v-model="lineState.fiberCount" class="w-full" />
                  </UFormField>
                  <UFormField label="Długość m" name="lengthMeters">
                    <UInputNumber v-model="lineState.lengthMeters" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Status" name="status">
                  <USelect v-model="lineState.status" :items="['PLANNED', 'ACTIVE', 'DECOMMISSIONED']" class="w-full" />
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
        :data="data.data"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły linii"
        :subtitle="selectedRow?.inventoryId"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

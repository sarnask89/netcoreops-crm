<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface TariffRow {
  id: number
  name: string
  serviceType: string
  defaultNetPrice: string
  vatRate: string
  downloadMbps?: number | null
  uploadMbps?: number | null
  queueName?: string | null
  iptvPackageCode?: string | null
  description?: string | null
  isActive: boolean
}

const toast = useToast()
const open = ref(false)
const detailsOpen = ref(false)
const selectedRow = ref<TariffRow | null>(null)
const editingTariffId = ref<number | null>(null)
const query = ref('')
const typeFilter = ref<'all' | 'internet' | 'iptv' | 'voip' | 'other'>('all')
const schema = z.object({
  name: z.string().min(1),
  serviceType: z.enum(['internet', 'iptv', 'voip', 'other']),
  defaultNetPrice: z.number().min(0),
  vatRate: z.number().min(0).max(100),
  downloadMbps: z.number().int().positive().nullable().optional(),
  uploadMbps: z.number().int().positive().nullable().optional(),
  queueName: z.string().optional(),
  iptvPackageCode: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean()
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({ serviceType: 'internet', defaultNetPrice: 0, vatRate: 23, isActive: true })
const { data, status, refresh } = await useFetch<{ success: boolean, data: TariffRow[] }>('/api/billing/tariffs', {
  default: () => ({ success: false, data: [] })
})
const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.name, row.serviceType, row.queueName, row.iptvPackageCode].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const matchesType = typeFilter.value === 'all' || row.serviceType === typeFilter.value
  return matchesQuery && matchesType
}))
const columns: TableColumn<TariffRow>[] = [
  { accessorKey: 'name', header: 'Taryfa' },
  { accessorKey: 'serviceType', header: 'Typ' },
  {
    id: 'speed',
    header: 'Parametry',
    cell: ({ row }) => row.original.serviceType === 'internet'
      ? `${row.original.downloadMbps || 0}/${row.original.uploadMbps || 0} Mb/s`
      : row.original.iptvPackageCode || row.original.queueName || 'Brak'
  },
  { accessorKey: 'defaultNetPrice', header: 'Cena netto' },
  { accessorKey: 'vatRate', header: 'VAT %' },
  { accessorKey: 'isActive', header: 'Aktywna' }
]

function resetForm() {
  editingTariffId.value = null
  selectedRow.value = null
  Object.assign(state, {
    name: undefined,
    serviceType: 'internet',
    defaultNetPrice: 0,
    vatRate: 23,
    downloadMbps: undefined,
    uploadMbps: undefined,
    queueName: undefined,
    iptvPackageCode: undefined,
    description: undefined,
    isActive: true
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: TariffRow) {
  selectedRow.value = row
  editingTariffId.value = row.id
  Object.assign(state, {
    name: row.name,
    serviceType: row.serviceType as Schema['serviceType'],
    defaultNetPrice: Number(row.defaultNetPrice),
    vatRate: Number(row.vatRate),
    downloadMbps: row.downloadMbps ?? undefined,
    uploadMbps: row.uploadMbps ?? undefined,
    queueName: row.queueName || undefined,
    iptvPackageCode: row.iptvPackageCode || undefined,
    description: row.description || undefined,
    isActive: row.isActive
  })
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch(editingTariffId.value ? `/api/billing/tariffs/${editingTariffId.value}` : '/api/billing/tariffs', {
    method: editingTariffId.value ? 'PATCH' : 'POST',
    body: event.data
  })
  toast.add({ title: 'Taryfa zapisana', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deleteTariff(row: TariffRow) {
  if (!window.confirm(`Usunąć taryfę ${row.name}?`)) return
  await $fetch(`/api/billing/tariffs/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Taryfa usunięta', color: 'success' })
  await refresh()
}

function showDetails(row: TariffRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: TariffRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj taryfę', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Szczegóły taryfy', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Usuń taryfę', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteTariff(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="billing-tariffs" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Taryfy">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj"
            class="w-56"
          />
          <USelect
            v-model="typeFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Internet', value: 'internet' },
              { label: 'IPTV', value: 'iptv' },
              { label: 'VoIP', value: 'voip' },
              { label: 'Inne', value: 'other' }
            ]"
            class="w-40"
          />
          <USlideover v-model:open="open" :title="editingTariffId ? 'Edytuj taryfę' : 'Dodaj taryfę'">
            <UButton label="Dodaj taryfę" icon="i-lucide-receipt" @click="openCreate" />
            <template #body>
              <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
              >
                <UFormField label="Nazwa" name="name" required>
                  <UInput v-model="state.name" class="w-full" />
                </UFormField>
                <UFormField label="Typ" name="serviceType">
                  <USelect v-model="state.serviceType" :items="['internet', 'iptv', 'voip', 'other']" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Cena netto" name="defaultNetPrice">
                    <UInputNumber v-model="state.defaultNetPrice" class="w-full" />
                  </UFormField>
                  <UFormField label="VAT %" name="vatRate">
                    <UInputNumber v-model="state.vatRate" class="w-full" />
                  </UFormField>
                  <UFormField label="Download Mb/s" name="downloadMbps">
                    <UInputNumber v-model="state.downloadMbps" class="w-full" />
                  </UFormField>
                  <UFormField label="Upload Mb/s" name="uploadMbps">
                    <UInputNumber v-model="state.uploadMbps" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Queue" name="queueName">
                  <UInput v-model="state.queueName" class="w-full" />
                </UFormField>
                <UFormField label="Pakiet IPTV" name="iptvPackageCode">
                  <UInput v-model="state.iptvPackageCode" class="w-full" />
                </UFormField>
                <UFormField label="Opis" name="description">
                  <UTextarea v-model="state.description" class="w-full" />
                </UFormField>
                <UFormField label="Aktywna" name="isActive">
                  <USwitch v-model="state.isActive" />
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
        title="Szczegóły taryfy"
        :subtitle="selectedRow?.name"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

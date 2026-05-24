<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface SubscriptionRow {
  id: string
  status: string
  billingPeriod: string
  priceOverrideNet?: string | null
  discountPercent?: string | null
  activationFee?: string | null
  notes?: string | null
  customer: { id: string, fullName: string }
  customerDevice?: { id: string, hostname: string, ipAddress?: string | null } | null
  tariff: { id: number, name: string, defaultNetPrice: string }
}
interface OptionsResponse {
  success: boolean
  data: {
    customers: Array<{ id: string, fullName: string }>
    customerDevices: Array<{ id: string, hostname: string }>
    tariffs: Array<{ id: number, name: string, defaultNetPrice: string }>
  }
}

const toast = useToast()
const open = ref(false)
const detailsOpen = ref(false)
const selectedRow = ref<SubscriptionRow | null>(null)
const editingSubscriptionId = ref<string | null>(null)
const query = ref('')
const statusFilter = ref<'all' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'>('all')
const schema = z.object({
  customerId: z.string().uuid(),
  customerDeviceId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TERMINATED']),
  billingPeriod: z.enum(['monthly', 'quarterly', 'yearly']),
  priceOverrideNet: z.number().min(0).nullable().optional(),
  discountPercent: z.number().min(0).max(100),
  activationFee: z.number().min(0),
  notes: z.string().optional()
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({ status: 'ACTIVE', billingPeriod: 'monthly', discountPercent: 0, activationFee: 0 })
const { data, status, refresh } = await useFetch<{ success: boolean, data: SubscriptionRow[] }>('/api/billing/subscriptions', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { customers: [], customerDevices: [], tariffs: [] } })
})
const customerItems = computed(() => options.value.data.customers.map(item => ({ label: item.fullName, value: item.id })))
const deviceItems = computed(() => [{ label: 'Bez urządzenia', value: null }, ...options.value.data.customerDevices.map(item => ({ label: item.hostname, value: item.id }))])
const tariffItems = computed(() => options.value.data.tariffs.map(item => ({ label: `${item.name} (${item.defaultNetPrice} netto)`, value: item.id })))
const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.customer.fullName, row.customerDevice?.hostname, row.customerDevice?.ipAddress, row.tariff.name, row.status].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
  return matchesQuery && matchesStatus
}))
const columns: TableColumn<SubscriptionRow>[] = [
  { accessorKey: 'customer.fullName', header: 'Klient' },
  { accessorKey: 'customerDevice.hostname', header: 'Urządzenie' },
  { accessorKey: 'tariff.name', header: 'Taryfa' },
  { accessorKey: 'status', header: 'Status' },
  {
    id: 'price',
    header: 'Cena netto',
    cell: ({ row }) => row.original.priceOverrideNet || row.original.tariff.defaultNetPrice
  }
]
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch(editingSubscriptionId.value ? `/api/billing/subscriptions/${editingSubscriptionId.value}` : '/api/billing/subscriptions', {
    method: editingSubscriptionId.value ? 'PATCH' : 'POST',
    body: event.data
  })
  toast.add({ title: 'Subskrypcja zapisana', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

function resetForm() {
  editingSubscriptionId.value = null
  selectedRow.value = null
  Object.assign(state, {
    customerId: undefined,
    customerDeviceId: null,
    tariffId: undefined,
    status: 'ACTIVE',
    billingPeriod: 'monthly',
    priceOverrideNet: undefined,
    discountPercent: 0,
    activationFee: 0,
    notes: undefined
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: SubscriptionRow) {
  selectedRow.value = row
  editingSubscriptionId.value = row.id
  Object.assign(state, {
    customerId: row.customer.id,
    customerDeviceId: row.customerDevice?.id || null,
    tariffId: row.tariff.id,
    status: row.status as Schema['status'],
    billingPeriod: row.billingPeriod as Schema['billingPeriod'],
    priceOverrideNet: row.priceOverrideNet == null ? undefined : Number(row.priceOverrideNet),
    discountPercent: row.discountPercent == null ? 0 : Number(row.discountPercent),
    activationFee: row.activationFee == null ? 0 : Number(row.activationFee),
    notes: row.notes || undefined
  })
  open.value = true
}

async function deleteSubscription(row: SubscriptionRow) {
  if (!window.confirm(`Usunąć subskrypcję ${row.customer.fullName} / ${row.tariff.name}?`)) return
  await $fetch(`/api/billing/subscriptions/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Subskrypcja usunięta', color: 'success' })
  await refresh()
}

function showDetails(row: SubscriptionRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: SubscriptionRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj subskrypcję', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Szczegóły subskrypcji', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Usuń subskrypcję', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteSubscription(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="billing-subscriptions" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Subskrypcje">
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
            v-model="statusFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Aktywne', value: 'ACTIVE' },
              { label: 'Wstrzymane', value: 'SUSPENDED' },
              { label: 'Zakończone', value: 'TERMINATED' }
            ]"
            class="w-44"
          />
          <USlideover v-model:open="open" :title="editingSubscriptionId ? 'Edytuj subskrypcję' : 'Dodaj subskrypcję'">
            <UButton label="Dodaj subskrypcję" icon="i-lucide-badge-dollar-sign" @click="openCreate" />
            <template #body>
              <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
              >
                <UFormField label="Klient" name="customerId" required>
                  <USelect v-model="state.customerId" :items="customerItems" class="w-full" />
                </UFormField>
                <UFormField label="Urządzenie klienta" name="customerDeviceId">
                  <USelect v-model="state.customerDeviceId" :items="deviceItems" class="w-full" />
                </UFormField>
                <UFormField label="Taryfa" name="tariffId" required>
                  <USelect v-model="state.tariffId" :items="tariffItems" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Cena ręczna netto" name="priceOverrideNet">
                    <UInputNumber v-model="state.priceOverrideNet" class="w-full" />
                  </UFormField>
                  <UFormField label="Rabat %" name="discountPercent">
                    <UInputNumber v-model="state.discountPercent" class="w-full" />
                  </UFormField>
                  <UFormField label="Opłata aktywacyjna" name="activationFee">
                    <UInputNumber v-model="state.activationFee" class="w-full" />
                  </UFormField>
                  <UFormField label="Okres" name="billingPeriod">
                    <USelect v-model="state.billingPeriod" :items="['monthly', 'quarterly', 'yearly']" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Status" name="status">
                  <USelect v-model="state.status" :items="['ACTIVE', 'SUSPENDED', 'TERMINATED']" class="w-full" />
                </UFormField>
                <UFormField label="Notatki" name="notes">
                  <UTextarea v-model="state.notes" class="w-full" />
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
        title="Szczegóły subskrypcji"
        :subtitle="selectedRow?.customer.fullName"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

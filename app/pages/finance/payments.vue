<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface PaymentRow {
  id: string
  amount: string
  paymentDate: string
  paymentMethod?: string | null
  reference?: string | null
  notes?: string | null
  customer: { id: string, fullName: string }
  document?: { id: string, fullNumber: string } | null
}

interface OptionsResponse {
  success: boolean
  data: {
    customers: Array<{ id: string, fullName: string }>
    documents: Array<{ id: string, fullNumber: string }>
  }
}

const toast = useToast()
const open = ref(false)
const selectedRow = ref<PaymentRow | null>(null)
const editingId = ref<string | null>(null)
const query = ref('')

const schema = z.object({
  customerId: z.string().uuid(),
  documentId: z.string().uuid().nullable().optional(),
  amount: z.number().positive(),
  paymentDate: z.string(),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ paymentDate: new Date().toISOString().split('T')[0] })

const { data, status, refresh } = await useFetch<{ success: boolean, data: PaymentRow[] }>('/api/finance/payments', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { customers: [], documents: [] } })
})

const customerItems = computed(() => options.value.data.customers.map(c => ({ label: c.fullName, value: c.id })))
const documentItems = computed(() => [{ label: 'Bez dokumentu', value: null }, ...options.value.data.documents.map(d => ({ label: d.fullNumber, value: d.id }))])

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(r =>
    [r.reference, r.customer.fullName, r.document?.fullNumber, r.paymentMethod]
      .filter(Boolean).some(v => v!.toLowerCase().includes(q))
  )
})

const columns: TableColumn<PaymentRow>[] = [
  { accessorKey: 'reference', header: 'Tytuł' },
  { accessorKey: 'customer.fullName', header: 'Klient' },
  { accessorKey: 'amount', header: 'Kwota' },
  { accessorKey: 'paymentDate', header: 'Data' },
  { accessorKey: 'paymentMethod', header: 'Metoda' },
  { accessorKey: 'document.fullNumber', header: 'Dokument' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, {
    customerId: undefined,
    documentId: null,
    amount: undefined,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: undefined,
    reference: undefined,
    notes: undefined
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: PaymentRow) {
  selectedRow.value = row
  editingId.value = row.id
  Object.assign(state, {
    customerId: row.customer.id,
    documentId: row.document?.id || null,
    amount: Number(row.amount),
    paymentDate: row.paymentDate,
    paymentMethod: row.paymentMethod || undefined,
    reference: row.reference || undefined,
    notes: row.notes || undefined
  })
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch(editingId.value ? `/api/finance/payments/${editingId.value}` : '/api/finance/payments', {
    method: editingId.value ? 'PATCH' : 'POST',
    body: event.data
  })
  toast.add({ title: 'Płatność zapisana', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deletePayment(row: PaymentRow) {
  if (!window.confirm(`Usunąć płatność ${row.reference || row.id}?`)) return
  await $fetch(`/api/finance/payments/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Płatność usunięta', color: 'success' })
  await refresh()
}

function rowContextItems(row: PaymentRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deletePayment(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="finance-payments" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Płatności">
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
          <UButton
            color="primary"
            label="Dodaj płatność"
            icon="i-lucide-plus"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <AppDataTable
      :columns="columns"
      :data="rows"
      :loading="status === 'pending'"
      :context-items="rowContextItems"
    />

    <USlideover v-model:open="open">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ editingId ? 'Edytuj' : 'Dodaj' }} płatność
        </h3>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup label="Klient" name="customerId" required>
          <USelect v-model="state.customerId" :options="customerItems" searchable />
        </UFormGroup>
        <UFormGroup label="Dokument" name="documentId">
          <USelect v-model="state.documentId" :options="documentItems" searchable />
        </UFormGroup>
        <UFormGroup label="Kwota" name="amount" required>
          <UInput v-model="state.amount" type="number" step="0.01" />
        </UFormGroup>
        <UFormGroup label="Data płatności" name="paymentDate" required>
          <UInput v-model="state.paymentDate" type="date" />
        </UFormGroup>
        <UFormGroup label="Metoda" name="paymentMethod">
          <USelect
            v-model="state.paymentMethod"
            :options="[
              { label: 'Przelew', value: 'transfer' },
              { label: 'Gotówka', value: 'cash' },
              { label: 'Karta', value: 'card' },
              { label: 'BLIK', value: 'blik' },
              { label: 'PayU', value: 'payu' },
              { label: 'Inne', value: 'other' }
            ]"
            clearable
          />
        </UFormGroup>
        <UFormGroup label="Tytuł / Referencja" name="reference">
          <UInput v-model="state.reference" />
        </UFormGroup>
        <UFormGroup label="Notatki" name="notes">
          <UTextarea v-model="state.notes" />
        </UFormGroup>
        <UButton
          type="submit"
          color="primary"
          label="Zapisz"
          :loading="status === 'pending'"
        />
      </UForm>
    </USlideover>
  </UDashboardPanel>
</template>

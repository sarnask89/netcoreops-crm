<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface DocumentRow {
  id: string
  type: string
  fullNumber: string
  issueDate: string
  totalNet: string
  totalVat: string
  totalGross: string
  paymentStatus: string
  isCancelled: boolean
  customer?: { id: string, fullName: string } | null
  numberPlan?: { id: number, name: string } | null
}

interface CustomerOpt {
  id: string
  fullName: string
}

const toast = useToast()
const open = ref(false)
const generateOpen = ref(false)
const detailsOpen = ref(false)
const selectedRow = ref<DocumentRow | null>(null)
const editingId = ref<string | null>(null)
const query = ref('')
const typeFilter = ref<'all' | 'invoice' | 'proforma' | 'credit_note' | 'receipt'>('all')
const statusFilter = ref<'all' | 'unpaid' | 'partial' | 'paid'>('all')

const itemSchema = z.object({
  ordinal: z.number(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitNetPrice: z.number().nonnegative(),
  vatRate: z.number().nonnegative().max(100)
})

const schema = z.object({
  type: z.enum(['invoice', 'proforma', 'credit_note', 'receipt']),
  customerId: z.string().uuid(),
  issueDate: z.string(),
  saleDate: z.string(),
  dueDate: z.string().nullable().optional(),
  paymentMethod: z.string().default('transfer'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1)
})
type Schema = z.output<typeof schema>

const generateSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionIds: z.array(z.string().uuid()).min(1),
  issueDate: z.string(),
  saleDate: z.string(),
  dueDate: z.string().nullable().optional(),
  numberPlanId: z.number().int().positive().nullable().optional()
})
type GenerateSchema = z.output<typeof generateSchema>

const editSchema = z.object({
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  dueDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isCancelled: z.boolean().optional()
})
type EditSchema = z.output<typeof editSchema>

const today = new Date().toISOString().split('T')[0]
const state = reactive<Partial<Schema>>({ type: 'invoice', paymentMethod: 'transfer', issueDate: today, saleDate: today, items: [{ ordinal: 1, description: '', quantity: 1, unitNetPrice: 0, vatRate: 23 }] })
const editState = reactive<Partial<EditSchema>>({})
const generateState = reactive<Partial<GenerateSchema>>({ issueDate: today, saleDate: today })

const { data, status, refresh } = await useFetch<{ success: boolean, data: DocumentRow[] }>('/api/finance/documents', {
  default: () => ({ success: false, data: [] })
})

const { data: optionsData } = await useFetch<{ success: boolean, data: { customers: CustomerOpt[] } }>('/api/system/options', {
  default: () => ({ success: false, data: { customers: [] } })
})

const customerItems = computed(() => optionsData.value.data.customers.map(c => ({ label: c.fullName, value: c.id })))

const rows = computed(() => {
  const all = data.value.data || []
  return all.filter((row) => {
    const text = [row.fullNumber, row.customer?.fullName, row.type].filter(Boolean).join(' ').toLowerCase()
    const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || row.type === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' || row.paymentStatus === statusFilter.value
    return matchesQuery && matchesType && matchesStatus
  })
})

const columns: TableColumn<DocumentRow>[] = [
  {
    id: 'fullNumber',
    header: 'Numer',
    cell: ({ row }) => row.original.fullNumber
  },
  { accessorKey: 'customer.fullName', header: 'Klient' },
  { accessorKey: 'type', header: 'Typ' },
  { accessorKey: 'issueDate', header: 'Data' },
  { accessorKey: 'totalGross', header: 'Kwota brutto' },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.paymentStatus
  }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, {
    type: 'invoice',
    customerId: undefined,
    issueDate: today,
    saleDate: today,
    dueDate: undefined,
    paymentMethod: 'transfer',
    notes: undefined,
    items: [{ ordinal: 1, description: '', quantity: 1, unitNetPrice: 0, vatRate: 23 }]
  })
}

function resetEditForm() {
  Object.assign(editState, {})
}

function resetGenerateForm() {
  Object.assign(generateState, { customerId: undefined, subscriptionIds: [], issueDate: today, saleDate: today, dueDate: undefined, numberPlanId: undefined })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: DocumentRow) {
  selectedRow.value = row
  editingId.value = row.id
  resetEditForm()
  open.value = true
}

function openGenerate() {
  resetGenerateForm()
  generateOpen.value = true
}

function showDetails(row: DocumentRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function addItem() {
  const items = state.items || []
  const lastOrdinal = items.length > 0 ? (items[items.length - 1]?.ordinal ?? 0) : 0
  items.push({ ordinal: lastOrdinal + 1, description: '', quantity: 1, unitNetPrice: 0, vatRate: 23 })
  state.items = [...items]
}

function removeItem(index: number) {
  const items = state.items || []
  items.splice(index, 1)
  state.items = [...items]
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const body = {
    ...event.data,
    items: event.data.items.map(item => ({
      ...item,
      netAmount: item.unitNetPrice * item.quantity,
      vatAmount: (item.unitNetPrice * item.quantity * item.vatRate) / 100,
      grossAmount: item.unitNetPrice * item.quantity + (item.unitNetPrice * item.quantity * item.vatRate) / 100
    }))
  }
  const totals = body.items.reduce((acc, item) => ({
    net: acc.net + item.netAmount,
    vat: acc.vat + item.vatAmount,
    gross: acc.gross + item.grossAmount
  }), { net: 0, vat: 0, gross: 0 })
  const payload = { ...body, totalNet: totals.net, totalVat: totals.vat, totalGross: totals.gross, items: body.items.map((item, index) => ({ ...item, ordinal: index + 1 })) }

  await $fetch('/api/finance/documents', { method: 'POST', body: payload })
  toast.add({ title: 'Dokument utworzony', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function onEditSubmit(event: FormSubmitEvent<EditSchema>) {
  if (!editingId.value) return
  await $fetch(`/api/finance/documents/${editingId.value}`, { method: 'PATCH', body: event.data })
  toast.add({ title: 'Dokument zaktualizowany', color: 'success' })
  open.value = false
  resetEditForm()
  await refresh()
}

async function onGenerateSubmit(event: FormSubmitEvent<GenerateSchema>) {
  await $fetch('/api/finance/generate', { method: 'POST', body: event.data })
  toast.add({ title: 'Faktura wygenerowana', color: 'success' })
  generateOpen.value = false
  resetGenerateForm()
  await refresh()
}

async function deleteDocument(row: DocumentRow) {
  if (!window.confirm(`Usunąć dokument ${row.fullNumber}?`)) return
  await $fetch(`/api/finance/documents/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Dokument usunięty', color: 'success' })
  await refresh()
}

async function toggleCancel(row: DocumentRow) {
  await $fetch(`/api/finance/documents/${row.id}`, { method: 'PATCH', body: { isCancelled: !row.isCancelled } })
  toast.add({ title: row.isCancelled ? 'Dokument przywrócony' : 'Dokument anulowany', color: 'success' })
  await refresh()
}

function rowContextItems(row: DocumentRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteDocument(row) }
  ], [
    {
      label: row.isCancelled ? 'Przywróć' : 'Anuluj',
      icon: 'i-lucide-ban',
      color: 'warning',
      onSelect: () => toggleCancel(row)
    },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="finance-documents" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Dokumenty">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USelect
            v-model="typeFilter"
            :options="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Faktura', value: 'invoice' },
              { label: 'Proforma', value: 'proforma' },
              { label: 'Nota kredytowa', value: 'credit_note' },
              { label: 'Paragon', value: 'receipt' }
            ]"
            class="w-36"
          />
          <USelect
            v-model="statusFilter"
            :options="[
              { label: 'Wszystkie statusy', value: 'all' },
              { label: 'Niezapłacone', value: 'unpaid' },
              { label: 'Częściowo', value: 'partial' },
              { label: 'Zapłacone', value: 'paid' }
            ]"
            class="w-40"
          />
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj"
            class="w-48"
          />
          <UButton
            color="primary"
            variant="soft"
            label="Generuj fakturę"
            icon="i-lucide-sparkles"
            @click="openGenerate"
          />
          <UButton
            color="primary"
            label="Dodaj dokument"
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

    <!-- Create Document Slideover -->
    <USlideover v-if="!editingId" v-model:open="open">
      <template #header>
        <h3 class="text-lg font-semibold">
          Nowy dokument
        </h3>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup label="Typ" name="type" required>
          <USelect
            v-model="state.type"
            :options="[
              { label: 'Faktura', value: 'invoice' },
              { label: 'Proforma', value: 'proforma' },
              { label: 'Nota kredytowa', value: 'credit_note' },
              { label: 'Paragon', value: 'receipt' }
            ]"
          />
        </UFormGroup>
        <UFormGroup label="Klient" name="customerId" required>
          <USelect v-model="state.customerId" :options="customerItems" searchable />
        </UFormGroup>
        <div class="flex gap-2">
          <UFormGroup label="Data wystawienia" name="issueDate" class="flex-1">
            <UInput v-model="state.issueDate" type="date" />
          </UFormGroup>
          <UFormGroup label="Data sprzedaży" name="saleDate" class="flex-1">
            <UInput v-model="state.saleDate" type="date" />
          </UFormGroup>
          <UFormGroup label="Termin" name="dueDate" class="flex-1">
            <UInput v-model="(state.dueDate as string | undefined)" type="date" />
          </UFormGroup>
        </div>
        <UFormGroup label="Metoda płatności" name="paymentMethod">
          <USelect
            v-model="state.paymentMethod"
            :options="[
              { label: 'Przelew', value: 'transfer' },
              { label: 'Gotówka', value: 'cash' },
              { label: 'Karta', value: 'card' }
            ]"
          />
        </UFormGroup>

        <div class="space-y-3 border rounded-lg p-3">
          <div class="flex items-center justify-between">
            <span class="font-medium">Pozycje</span>
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              icon="i-lucide-plus"
              @click="addItem"
            />
          </div>
          <div v-for="(item, index) in state.items" :key="index" class="flex flex-col gap-2 border-b pb-2">
            <div class="flex gap-1 items-start">
              <UFormGroup :label="`#${item.ordinal}`" class="flex-1">
                <UInput v-model="item.description" placeholder="Opis" />
              </UFormGroup>
              <UButton
                size="sm"
                color="error"
                variant="ghost"
                icon="i-lucide-x"
                @click="removeItem(index)"
              />
            </div>
            <div class="flex gap-2">
              <UFormGroup label="Ilość" class="w-20">
                <UInput v-model="item.quantity" type="number" step="0.001" />
              </UFormGroup>
              <UFormGroup label="Cena netto" class="flex-1">
                <UInput v-model="item.unitNetPrice" type="number" step="0.01" />
              </UFormGroup>
              <UFormGroup label="VAT %" class="w-20">
                <UInput v-model="item.vatRate" type="number" step="0.01" />
              </UFormGroup>
              <UFormGroup label="Netto" class="w-24">
                <span class="text-sm py-2 block">{{ (item.unitNetPrice * item.quantity).toFixed(2) }}</span>
              </UFormGroup>
            </div>
          </div>
        </div>

        <UFormGroup label="Notatki" name="notes">
          <UTextarea v-model="state.notes" />
        </UFormGroup>
        <UButton
          type="submit"
          color="primary"
          label="Utwórz dokument"
          :loading="status === 'pending'"
        />
      </UForm>
    </USlideover>

    <!-- Edit Document Slideover -->
    <USlideover v-if="editingId" v-model:open="open">
      <template #header>
        <h3 class="text-lg font-semibold">
          Edytuj dokument
        </h3>
      </template>
      <UForm
        :schema="editSchema"
        :state="editState"
        class="p-4 space-y-4"
        @submit="onEditSubmit"
      >
        <UFormGroup label="Status płatności" name="paymentStatus">
          <USelect
            v-model="editState.paymentStatus"
            :options="[
              { label: 'Niezapłacone', value: 'unpaid' },
              { label: 'Częściowo', value: 'partial' },
              { label: 'Zapłacone', value: 'paid' }
            ]"
          />
        </UFormGroup>
        <UFormGroup label="Metoda płatności" name="paymentMethod">
          <UInput v-model="editState.paymentMethod" />
        </UFormGroup>
        <UFormGroup label="Termin" name="dueDate">
          <UInput v-model="(editState.dueDate as string | undefined)" type="date" />
        </UFormGroup>
        <UFormGroup label="Notatki" name="notes">
          <UTextarea v-model="(editState.notes as string | undefined)" />
        </UFormGroup>
        <div class="flex items-center gap-2">
          <UToggle v-model="editState.isCancelled" :label="editState.isCancelled ? 'Anulowany' : 'Aktywny'" />
        </div>
        <UButton
          type="submit"
          color="primary"
          label="Zapisz"
          :loading="status === 'pending'"
        />
      </UForm>
    </USlideover>

    <!-- Generate Invoice Slideover -->
    <USlideover v-model:open="generateOpen">
      <template #header>
        <h3 class="text-lg font-semibold">
          Generuj fakturę z subskrypcji
        </h3>
      </template>
      <UForm
        :schema="generateSchema"
        :state="generateState"
        class="p-4 space-y-4"
        @submit="onGenerateSubmit"
      >
        <UFormGroup label="Klient" name="customerId" required>
          <USelect v-model="generateState.customerId" :options="customerItems" searchable />
        </UFormGroup>
        <UFormGroup label="Data wystawienia" name="issueDate">
          <UInput v-model="generateState.issueDate" type="date" />
        </UFormGroup>
        <UFormGroup label="Data sprzedaży" name="saleDate">
          <UInput v-model="generateState.saleDate" type="date" />
        </UFormGroup>
        <UFormGroup label="Termin płatności" name="dueDate">
          <UInput v-model="(generateState.dueDate as string | undefined)" type="date" />
        </UFormGroup>
        <UButton
          type="submit"
          color="primary"
          label="Generuj"
          :loading="status === 'pending'"
        />
      </UForm>
    </USlideover>

    <!-- Details Slideover -->
    <USlideover v-if="selectedRow" v-model:open="detailsOpen">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ selectedRow.fullNumber }}
        </h3>
      </template>
      <div class="p-4 space-y-3">
        <p><strong>Klient:</strong> {{ selectedRow.customer?.fullName }}</p>
        <p><strong>Typ:</strong> {{ selectedRow.type }}</p>
        <p><strong>Data:</strong> {{ selectedRow.issueDate }}</p>
        <p><strong>Netto:</strong> {{ selectedRow.totalNet }} PLN</p>
        <p><strong>VAT:</strong> {{ selectedRow.totalVat }} PLN</p>
        <p><strong>Brutto:</strong> {{ selectedRow.totalGross }} PLN</p>
        <p><strong>Status:</strong> {{ selectedRow.paymentStatus }}</p>
      </div>
    </USlideover>
  </UDashboardPanel>
</template>

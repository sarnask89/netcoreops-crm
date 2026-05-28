<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface NumberPlanRow {
  id: number
  name: string
  template: string
  period: string
  doctype: string
  isDefault: boolean
  nextNumber: number
  isActive: boolean
}

const toast = useToast()
const open = ref(false)
const selectedRow = ref<NumberPlanRow | null>(null)
const editingId = ref<number | null>(null)
const query = ref('')

const schema = z.object({
  name: z.string().min(1),
  template: z.string().min(1),
  period: z.enum(['yearly', 'monthly', 'daily', 'continuous']),
  doctype: z.enum(['invoice', 'proforma', 'credit_note', 'receipt']),
  isDefault: z.boolean(),
  nextNumber: z.number().int().positive(),
  isActive: z.boolean()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ period: 'yearly', doctype: 'invoice', isDefault: false, nextNumber: 1, isActive: true })

const { data, status, refresh } = await useFetch<{ success: boolean, data: NumberPlanRow[] }>('/api/finance/number-plans', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(r => [r.name, r.template, r.doctype, r.period].some(v => v.toLowerCase().includes(q)))
})

const columns: TableColumn<NumberPlanRow>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'template', header: 'Szablon' },
  { accessorKey: 'doctype', header: 'Typ dokumentu' },
  { accessorKey: 'period', header: 'Okres' },
  { accessorKey: 'nextNumber', header: 'Następny numer' },
  { accessorKey: 'isDefault', header: 'Domyślny' },
  { accessorKey: 'isActive', header: 'Aktywny' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, {
    name: undefined,
    template: undefined,
    period: 'yearly',
    doctype: 'invoice',
    isDefault: false,
    nextNumber: 1,
    isActive: true
  })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: NumberPlanRow) {
  selectedRow.value = row
  editingId.value = row.id
  Object.assign(state, {
    name: row.name,
    template: row.template,
    period: row.period as Schema['period'],
    doctype: row.doctype as Schema['doctype'],
    isDefault: row.isDefault,
    nextNumber: row.nextNumber,
    isActive: row.isActive
  })
  open.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch(editingId.value ? `/api/finance/number-plans/${editingId.value}` : '/api/finance/number-plans', {
    method: editingId.value ? 'PATCH' : 'POST',
    body: event.data
  })
  toast.add({ title: 'Plan numeracji zapisany', color: 'success' })
  open.value = false
  resetForm()
  await refresh()
}

async function deletePlan(row: NumberPlanRow) {
  if (!window.confirm(`Usunąć plan numeracji ${row.name}?`)) return
  await $fetch(`/api/finance/number-plans/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Plan numeracji usunięty', color: 'success' })
  await refresh()
}

function rowContextItems(row: NumberPlanRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deletePlan(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="finance-number-plans" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Plany numeracji">
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
            label="Dodaj plan"
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
          {{ editingId ? 'Edytuj' : 'Dodaj' }} plan numeracji
        </h3>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup label="Nazwa" name="name" required>
          <UInput v-model="state.name" />
        </UFormGroup>
        <UFormGroup
          label="Szablon"
          name="template"
          required
          help="%Y %m %d %NUMBER%"
        >
          <UInput v-model="state.template" placeholder="FV/%Y/%m/%NUMBER%" />
        </UFormGroup>
        <UFormGroup label="Typ dokumentu" name="doctype" required>
          <USelect
            v-model="state.doctype"
            :options="[
              { label: 'Faktura', value: 'invoice' },
              { label: 'Proforma', value: 'proforma' },
              { label: 'Nota kredytowa', value: 'credit_note' },
              { label: 'Paragon', value: 'receipt' }
            ]"
          />
        </UFormGroup>
        <UFormGroup label="Okres" name="period">
          <USelect
            v-model="state.period"
            :options="[
              { label: 'Roczny', value: 'yearly' },
              { label: 'Miesięczny', value: 'monthly' },
              { label: 'Dzienny', value: 'daily' },
              { label: 'Ciągły', value: 'continuous' }
            ]"
          />
        </UFormGroup>
        <UFormGroup label="Następny numer" name="nextNumber">
          <UInput v-model="state.nextNumber" type="number" />
        </UFormGroup>
        <UFormGroup label="Domyślny" name="isDefault">
          <UToggle v-model="state.isDefault" />
        </UFormGroup>
        <UFormGroup label="Aktywny" name="isActive">
          <UToggle v-model="state.isActive" />
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

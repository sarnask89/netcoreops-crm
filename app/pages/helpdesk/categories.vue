<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface TicketCategoryRow {
  id: number
  name: string
  description: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

const toast = useToast()
const open = ref(false)
const deleteOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedRow = ref<TicketCategoryRow | null>(null)

const schema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean()
})
type CategoryForm = z.output<typeof schema>

const state = reactive<Partial<CategoryForm>>({ sortOrder: 0, isActive: true })

const { data, status, refresh } = await useFetch<{ success: boolean, data: TicketCategoryRow[] }>('/api/helpdesk/categories', {
  default: () => ({ success: false, data: [] })
})

const columns: TableColumn<TicketCategoryRow>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'description', header: 'Opis' },
  { accessorKey: 'color', header: 'Kolor' },
  { accessorKey: 'sortOrder', header: 'Kolejność' },
  { accessorKey: 'isActive', header: 'Aktywna' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, { name: undefined, description: undefined, color: undefined, sortOrder: 0, isActive: true })
}

function openCreate() {
  resetForm()
  open.value = true
}

function openEdit(row: TicketCategoryRow) {
  editingId.value = row.id
  selectedRow.value = row
  Object.assign(state, {
    name: row.name,
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive
  })
  open.value = true
}

function openDelete(row: TicketCategoryRow) {
  selectedRow.value = row
  deleteOpen.value = true
}

async function save(event: FormSubmitEvent<CategoryForm>) {
  try {
    if (editingId.value) {
      await $fetch(`/api/helpdesk/categories/${editingId.value}`, { method: 'PATCH', body: event.data })
      toast.add({ title: 'Kategoria zaktualizowana', color: 'success' })
    } else {
      await $fetch('/api/helpdesk/categories', { method: 'POST', body: event.data })
      toast.add({ title: 'Kategoria dodana', color: 'success' })
    }
    open.value = false
    resetForm()
    await refresh()
  } catch {
    toast.add({ title: 'Nie udało się zapisać kategorii', color: 'error' })
  }
}

async function deleteCategory() {
  if (!selectedRow.value) return
  try {
    await $fetch(`/api/helpdesk/categories/${selectedRow.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Kategoria usunięta', color: 'success' })
    deleteOpen.value = false
    resetForm()
    await refresh()
  } catch {
    toast.add({ title: 'Nie udało się usunąć kategorii', color: 'error' })
  }
}

function rowContextItems(row: TicketCategoryRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => openDelete(row) }
  ], [
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="helpdesk-categories" :ui="{ body: 'p-0 gap-0' }">
    <template #header>
      <UDashboardNavbar title="Kategorie zgłoszeń">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="primary"
            label="Nowa kategoria"
            icon="i-lucide-plus"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <AppDataTable
      :data="data.data"
      :columns="columns"
      :loading="status === 'pending'"
      :row-context-items="rowContextItems"
    >
      <template #cell-color="{ row }">
        <span v-if="row.original.color" class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full border" :style="{ backgroundColor: row.original.color }" />
          {{ row.original.color }}
        </span>
        <span v-else>—</span>
      </template>
      <template #cell-isActive="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="subtle">
          {{ row.original.isActive ? 'Tak' : 'Nie' }}
        </UBadge>
      </template>
    </AppDataTable>

    <USlideover v-model:open="open">
      <template #header>
        <h2 class="font-semibold">
          {{ editingId ? 'Edytuj kategorię' : 'Nowa kategoria' }}
        </h2>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="save"
      >
        <UFormGroup label="Nazwa" name="name" required>
          <UInput v-model="state.name" />
        </UFormGroup>
        <UFormGroup label="Opis" name="description">
          <UTextarea v-model="state.description" :rows="3" />
        </UFormGroup>
        <UFormGroup label="Kolor" name="color">
          <UInput v-model="state.color" placeholder="#3b82f6" />
        </UFormGroup>
        <UFormGroup label="Kolejność" name="sortOrder">
          <UInputNumber v-model="state.sortOrder" :min="0" />
        </UFormGroup>
        <UFormGroup label="Aktywna" name="isActive">
          <UCheckbox v-model="state.isActive" label="Pokazuj kategorię" />
        </UFormGroup>
        <UButton
          type="submit"
          color="primary"
          label="Zapisz"
          class="w-full"
        />
      </UForm>
    </USlideover>

    <UModal v-model:open="deleteOpen">
      <template #header>
        <h2 class="font-semibold">
          Usuń kategorię
        </h2>
      </template>
      <template #body>
        <p class="text-sm text-muted">
          Czy na pewno usunąć kategorię {{ selectedRow?.name }}? Istniejące zgłoszenia stracą przypisanie kategorii.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Anuluj"
            @click="deleteOpen = false"
          />
          <UButton color="error" label="Usuń" @click="deleteCategory" />
        </div>
      </template>
    </UModal>
  </UDashboardPanel>
</template>

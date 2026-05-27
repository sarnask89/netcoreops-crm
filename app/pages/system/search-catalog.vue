<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface SearchCatalogRow {
  id: number
  label: string
  suffix?: string | null
  icon?: string | null
  to: string
  target?: string | null
  aliases?: string | null
  isActive: boolean
  sortOrder: number
}

const toast = useToast()
const itemOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedItem = ref<SearchCatalogRow | null>(null)
const detailsOpen = ref(false)

const itemSchema = z.object({
  label: z.string().min(1).max(255),
  suffix: z.string().max(100).optional(),
  icon: z.string().max(100).optional(),
  to: z.string().min(1).max(255),
  target: z.string().max(20).optional(),
  aliases: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int()
})

type ItemSchema = z.output<typeof itemSchema>

const itemState = reactive<Partial<ItemSchema>>({
  isActive: true,
  sortOrder: 0
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: SearchCatalogRow[] }>('/api/system/search-catalog', {
  default: () => ({ success: false, data: [] })
})

const columns: TableColumn<SearchCatalogRow>[] = [
  { accessorKey: 'label', header: 'Etykieta' },
  { accessorKey: 'suffix', header: 'Typ' },
  { accessorKey: 'to', header: 'Ścieżka' },
  {
    id: 'active',
    header: 'Aktywny',
    cell: ({ row }) => row.original.isActive ? 'Tak' : 'Nie'
  },
  { accessorKey: 'sortOrder', header: 'Kolejność' }
]

function resetForm() {
  editingId.value = null
  Object.assign(itemState, {
    label: '',
    suffix: '',
    icon: '',
    to: '',
    target: '',
    aliases: '',
    isActive: true,
    sortOrder: 0
  })
}

function editItem(item: SearchCatalogRow) {
  editingId.value = item.id
  Object.assign(itemState, {
    label: item.label,
    suffix: item.suffix || '',
    icon: item.icon || '',
    to: item.to,
    target: item.target || '',
    aliases: item.aliases || '',
    isActive: item.isActive,
    sortOrder: item.sortOrder
  })
  itemOpen.value = true
}

function showDetails(item: SearchCatalogRow) {
  selectedItem.value = item
  detailsOpen.value = true
}

async function deleteItem(item: SearchCatalogRow) {
  try {
    await $fetch(`/api/system/search-catalog/${item.id}`, { method: 'DELETE' })
    toast.add({ title: 'Wpis usunięty', color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: 'Nie udało się usunąć wpisu', color: 'error' })
  }
}

function rowContextItems(row: SearchCatalogRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => editItem(row) },
    { label: 'Szczegóły', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) }
  ], [
    { label: 'Usuń', icon: 'i-lucide-trash-2', onSelect: () => deleteItem(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}

async function saveItem(event: FormSubmitEvent<ItemSchema>) {
  const body = {
    ...event.data,
    suffix: event.data.suffix || null,
    icon: event.data.icon || null,
    target: event.data.target || null,
    aliases: event.data.aliases || null
  }

  if (editingId.value) {
    await $fetch(`/api/system/search-catalog/${editingId.value}`, { method: 'PATCH', body })
  } else {
    await $fetch('/api/system/search-catalog', { method: 'POST', body })
  }

  toast.add({ title: 'Wpis zapisany', color: 'success' })
  itemOpen.value = false
  resetForm()
  await refresh()
}
</script>

<template>
  <UDashboardPanel id="search-catalog" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Katalog wyszukiwarki">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="itemOpen" title="Wpis katalogu">
            <UButton label="Dodaj wpis" icon="i-lucide-plus" @click="resetForm" />
            <template #body>
              <UForm
                :schema="itemSchema"
                :state="itemState"
                class="space-y-4"
                @submit="saveItem"
              >
                <UFormField label="Etykieta" name="label" required>
                  <UInput v-model="itemState.label" class="w-full" />
                </UFormField>
                <UFormField label="Typ" name="suffix">
                  <UInput v-model="itemState.suffix" class="w-full" placeholder="Funkcja, Trasa, Słownik..." />
                </UFormField>
                <UFormField label="Ikona" name="icon">
                  <UInput v-model="itemState.icon" class="w-full" placeholder="i-lucide-..." />
                </UFormField>
                <UFormField label="Ścieżka" name="to" required>
                  <UInput v-model="itemState.to" class="w-full" placeholder="/path/to/page" />
                </UFormField>
                <UFormField label="Cel (target)" name="target">
                  <UInput v-model="itemState.target" class="w-full" placeholder="_blank" />
                </UFormField>
                <UFormField label="Aliasy (przecinkami)" name="aliases">
                  <UInput v-model="itemState.aliases" class="w-full" placeholder="alias1,alias2,alias3" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Kolejność" name="sortOrder">
                    <UInput v-model.number="itemState.sortOrder" type="number" class="w-full" />
                  </UFormField>
                  <UFormField label="Aktywny" name="isActive">
                    <USwitch v-model="itemState.isActive" />
                  </UFormField>
                </div>
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
        title="Szczegóły wpisu"
        :subtitle="selectedItem?.label"
        :item="selectedItem"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

type TabKey = 'media' | 'technologies' | 'teryt' | 'simc' | 'ulic' | 'cities'
type DictionaryRow = Record<string, unknown>
interface DictionariesResponse {
  success: boolean
  data: Record<TabKey, DictionaryRow[]>
}

const active = ref<TabKey>('teryt')
const detailsOpen = ref(false)
const selectedRow = ref<DictionaryRow | null>(null)
const { data, status, refresh } = await useFetch<DictionariesResponse>('/api/system/dictionaries', {
  default: () => ({
    success: false,
    data: { media: [], technologies: [], teryt: [], simc: [], ulic: [], cities: [] }
  })
})

const { data: citiesData, status: citiesStatus, refresh: citiesRefresh } = await useFetch<{ success: boolean, data: DictionaryRow[] }>('/api/system/dictionaries/cities', {
  default: () => ({ success: false, data: [] })
})

// City CRUD state
const cityDialogOpen = ref(false)
const deleteCityOpen = ref(false)
const editingCityId = ref<number | null>(null)
const cityName = ref('')
const cityIsActive = ref(true)
const citySaving = ref(false)
const cityDeleting = ref(false)

const tabs = [
  { label: 'TERYT', value: 'teryt' },
  { label: 'SIMC', value: 'simc' },
  { label: 'ULIC', value: 'ulic' },
  { label: 'Media UKE', value: 'media' },
  { label: 'Technologie UKE', value: 'technologies' },
  { label: 'Miasta', value: 'cities' }
]

const toast = useToast()

const columns = computed<TableColumn<DictionaryRow>[]>(() => {
  if (active.value === 'teryt') {
    return [
      { accessorKey: 'terytCode', header: 'TERYT' },
      { accessorKey: 'name', header: 'Nazwa' },
      { accessorKey: 'areaType', header: 'Typ' },
      { accessorKey: 'county', header: 'Powiat' },
      { accessorKey: 'commune', header: 'Gmina' }
    ]
  }

  if (active.value === 'simc') {
    return [
      { accessorKey: 'simcCode', header: 'SIMC' },
      { accessorKey: 'name', header: 'Miejscowość' },
      { accessorKey: 'localityType', header: 'Typ' },
      { accessorKey: 'terytArea.terytCode', header: 'TERYT' }
    ]
  }

  if (active.value === 'ulic') {
    return [
      { accessorKey: 'ulicCode', header: 'ULIC' },
      { accessorKey: 'streetType', header: 'Cecha' },
      { accessorKey: 'name', header: 'Ulica' },
      { accessorKey: 'locality.name', header: 'Miejscowość' },
      { accessorKey: 'locality.simcCode', header: 'SIMC' }
    ]
  }

  if (active.value === 'cities') {
    return [
      { accessorKey: 'name', header: 'Nazwa miasta' },
      { accessorKey: 'isActive', header: 'Aktywne' },
      { accessorKey: 'createdAt', header: 'Utworzono' }
    ]
  }

  return [
    { accessorKey: 'code', header: 'Kod' },
    { accessorKey: 'label', header: 'Etykieta' },
    { accessorKey: 'description', header: 'Opis' }
  ]
})

const rows = computed(() => active.value === 'cities' ? citiesData.value.data : (data.value.data[active.value] || []))
const isLoading = computed(() => active.value === 'cities' ? citiesStatus.value === 'pending' : status.value === 'pending')
const counts = computed(() => ({
  teryt: data.value.data.teryt.length,
  simc: data.value.data.simc.length,
  ulic: data.value.data.ulic.length,
  media: data.value.data.media.length,
  technologies: data.value.data.technologies.length,
  cities: citiesData.value.data.length
}))

function showDetails(row: DictionaryRow) {
  if (active.value === 'cities') {
    // For cities, open edit instead
    openCityEdit(row)
    return
  }
  selectedRow.value = row
  detailsOpen.value = true
}

function openCityCreate() {
  editingCityId.value = null
  cityName.value = ''
  cityIsActive.value = true
  cityDialogOpen.value = true
}

function openCityEdit(row: DictionaryRow) {
  editingCityId.value = row.id as number
  cityName.value = row.name as string
  cityIsActive.value = row.isActive as boolean
  cityDialogOpen.value = true
}

function cityErrorMessage(error: unknown, fallback: string) {
  const fetchError = error as {
    data?: { message?: string, statusMessage?: string }
    message?: string
    statusMessage?: string
  }
  return fetchError.data?.message
    || fetchError.data?.statusMessage
    || fetchError.statusMessage
    || fetchError.message
    || fallback
}

async function saveCity() {
  const name = cityName.value.trim()
  if (!name) {
    toast.add({ title: 'Nazwa miasta jest wymagana', color: 'warning' })
    return
  }

  citySaving.value = true
  try {
    if (editingCityId.value) {
      await $fetch(`/api/system/dictionaries/cities/${editingCityId.value}`, {
        method: 'PATCH',
        body: { name, isActive: cityIsActive.value }
      })
      toast.add({ title: 'Miasto zaktualizowane', color: 'success' })
    } else {
      await $fetch('/api/system/dictionaries/cities', {
        method: 'POST',
        body: { name, isActive: cityIsActive.value }
      })
      toast.add({ title: 'Miasto dodane', color: 'success' })
    }

    cityDialogOpen.value = false
    await citiesRefresh()
  } catch (error: unknown) {
    toast.add({
      title: 'Nie udało się zapisać miasta',
      description: cityErrorMessage(error, 'Spróbuj ponownie'),
      color: 'error'
    })
  } finally {
    citySaving.value = false
  }
}

function openCityDelete(row: DictionaryRow) {
  selectedRow.value = row
  deleteCityOpen.value = true
}

async function deleteCity() {
  if (!selectedRow.value) return
  cityDeleting.value = true
  try {
    await $fetch(`/api/system/dictionaries/cities/${selectedRow.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Miasto usunięte', color: 'success' })
    deleteCityOpen.value = false
    await citiesRefresh()
  } catch (error: unknown) {
    toast.add({
      title: 'Nie udało się usunąć miasta',
      description: cityErrorMessage(error, 'Spróbuj ponownie'),
      color: 'error'
    })
  } finally {
    cityDeleting.value = false
  }
}

function rowContextItems(row: DictionaryRow): ContextMenuItem[][] {
  if (active.value === 'cities') {
    return [[
      { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openCityEdit(row) },
      { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => openCityDelete(row) }
    ], [
      { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => citiesRefresh() }
    ]]
  }

  return [[
    { label: 'Szczegóły definicji', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="dictionaries" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Definicje i słowniki">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Odśwież"
            icon="i-lucide-refresh-cw"
            variant="subtle"
            @click="active === 'cities' ? citiesRefresh() : refresh()"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UTabs v-model="active" :items="tabs" />
        </template>
        <template #right>
          <UButton
            v-if="active === 'cities'"
            label="Dodaj miasto"
            icon="i-lucide-plus"
            variant="subtle"
            @click="openCityCreate"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid gap-3 p-4 sm:p-6 md:grid-cols-6">
        <div v-for="(count, key) in counts" :key="key" class="border border-default rounded-lg p-3">
          <p class="text-sm text-muted">
            {{ key }}
          </p>
          <p class="text-2xl font-semibold text-highlighted">
            {{ count }}
          </p>
        </div>
      </div>
      <AppDataTable
        :data="rows"
        :columns="columns"
        :loading="isLoading"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły definicji"
        :subtitle="active"
        :item="selectedRow"
      />

      <!-- City Create/Edit Slideover -->
      <USlideover v-model:open="cityDialogOpen" :title="editingCityId ? 'Edytuj miasto' : 'Dodaj miasto'">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Nazwa miasta" required>
              <UInput v-model="cityName" class="w-full" placeholder="Wpisz nazwę miasta" />
            </UFormField>
            <UFormField label="Aktywne">
              <UToggle v-model="cityIsActive" />
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Anuluj"
              color="neutral"
              variant="subtle"
              :disabled="citySaving"
              @click="cityDialogOpen = false"
            />
            <UButton
              label="Zapisz"
              icon="i-lucide-save"
              :loading="citySaving"
              @click="saveCity"
            />
          </div>
        </template>
      </USlideover>

      <!-- City Delete Confirmation -->
      <UModal v-model:open="deleteCityOpen" title="Usuń miasto">
        <template #body>
          <UAlert
            color="error"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            title="Czy na pewno chcesz usunąć to miasto?"
            :description="`Miasto: ${selectedRow?.name || ''}`"
          />
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Anuluj"
              color="neutral"
              variant="subtle"
              :disabled="cityDeleting"
              @click="deleteCityOpen = false"
            />
            <UButton
              label="Usuń"
              color="error"
              icon="i-lucide-trash-2"
              :loading="cityDeleting"
              @click="deleteCity"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

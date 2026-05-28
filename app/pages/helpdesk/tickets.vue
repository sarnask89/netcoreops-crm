<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

interface TicketRow {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  assignedTo: string | null
  customer: { id: string, fullName: string } | null
  category: { id: number, name: string } | null
}

interface CustomerOpt {
  id: string
  fullName: string
}

const toast = useToast()
const router = useRouter()
const route = useRoute()
const open = ref(false)
const query = ref('')
const statusFilter = ref<string>('all')
const priorityFilter = ref<string>('all')

const schema = z.object({
  subject: z.string().min(1).max(255),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  customerId: z.string().uuid(),
  categoryId: z.number().int().positive().optional(),
  assignedTo: z.string().max(255).optional(),
  message: z.string().min(1)
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ priority: 'normal' })

// Pre-fill customerId from URL if provided
const newCustomerId = computed(() => route.query.newCustomerId as string | undefined)
if (newCustomerId.value) {
  state.customerId = newCustomerId.value
}

const { data, status, refresh } = await useFetch<{ success: boolean, data: TicketRow[] }>('/api/helpdesk/tickets', {
  default: () => ({ success: false, data: [] })
})

const { data: customersData } = await useFetch<{ success: boolean, data: CustomerOpt[] }>('/api/crm/customers', {
  default: () => ({ success: false, data: [] })
})

const { data: categoriesData } = await useFetch<{ success: boolean, data: Array<{ id: number, name: string }> }>('/api/helpdesk/categories', {
  default: () => ({ success: false, data: [] })
})

const customerItems = computed(() =>
  customersData.value.data.map(c => ({ label: c.fullName, value: c.id }))
)

const categoryItems = computed(() =>
  categoriesData.value.data.map(c => ({ label: c.name, value: c.id }))
)

const filteredRows = computed(() => {
  const all = data.value.data || []
  let result = all
  const q = query.value.toLowerCase()

  if (q) {
    result = result.filter(r =>
      r.subject.toLowerCase().includes(q)
      || r.customer?.fullName.toLowerCase().includes(q)
      || r.assignedTo?.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    result = result.filter(r => r.status === statusFilter.value)
  }

  if (priorityFilter.value !== 'all') {
    result = result.filter(r => r.priority === priorityFilter.value)
  }

  return result
})

const columns: TableColumn<TicketRow>[] = [
  { accessorKey: 'subject', header: 'Temat' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'priority', header: 'Priorytet' },
  { accessorKey: 'customer.fullName', header: 'Klient' },
  { accessorKey: 'category.name', header: 'Kategoria' },
  { accessorKey: 'assignedTo', header: 'Przypisane do' },
  { accessorKey: 'createdAt', header: 'Utworzono' }
]

function rowContextItems(row: TicketRow): ContextMenuItem[][] {
  return [[
    {
      label: 'Szczegóły',
      icon: 'i-lucide-eye',
      onSelect: () => router.push(`/helpdesk/tickets/${row.id}`)
    },
    {
      label: 'Zmień status',
      icon: 'i-lucide-arrow-left-right',
      children: [
        { label: 'Otwarte', icon: 'i-lucide-circle', onSelect: () => updateStatus(row.id, 'open') },
        { label: 'W trakcie', icon: 'i-lucide-arrow-up-circle', onSelect: () => updateStatus(row.id, 'in_progress') },
        { label: 'Oczekujące', icon: 'i-lucide-clock', onSelect: () => updateStatus(row.id, 'waiting') },
        { label: 'Rozwiązane', icon: 'i-lucide-check-circle', onSelect: () => updateStatus(row.id, 'resolved') },
        { label: 'Zamknięte', icon: 'i-lucide-x-circle', onSelect: () => updateStatus(row.id, 'closed') }
      ]
    },
    {
      label: 'Przypisz do mnie',
      icon: 'i-lucide-user',
      onSelect: () => assignToMe(row.id)
    }
  ]]
}

async function updateStatus(id: string, status: string) {
  try {
    await $fetch(`/api/helpdesk/tickets/${id}`, {
      method: 'PATCH',
      body: { status }
    })
    toast.add({ title: 'Status zaktualizowany', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Błąd aktualizacji statusu', color: 'error' })
  }
}

async function assignToMe(id: string) {
  try {
    await $fetch(`/api/helpdesk/tickets/${id}`, {
      method: 'PATCH',
      body: { assignedTo: 'Ja' }
    })
    toast.add({ title: 'Przypisano do Ciebie', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Błąd przypisania', color: 'error' })
  }
}

function resetForm() {
  Object.assign(state, { subject: undefined, customerId: newCustomerId.value, message: undefined, priority: 'normal', categoryId: undefined, assignedTo: undefined })
}

async function create() {
  try {
    await $fetch('/api/helpdesk/tickets', {
      method: 'POST',
      body: state
    })
    toast.add({ title: 'Utworzono zgłoszenie', color: 'success' })
    open.value = false
    resetForm()
    refresh()
  } catch {
    toast.add({ title: 'Błąd tworzenia zgłoszenia', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="helpdesk-tickets" :ui="{ body: 'p-0 gap-0' }">
    <template #header>
      <UDashboardNavbar title="Zgłoszenia">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton color="primary" label="Nowe zgłoszenie" @click="open = true" />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="px-4 py-3 flex items-center gap-3 border-b">
      <UDashboardSearch v-model="query" placeholder="Szukaj zgłoszeń..." />
      <USelect
        v-model="statusFilter"
        :items="[
          { label: 'Wszystkie statusy', value: 'all' },
          { label: 'Otwarte', value: 'open' },
          { label: 'W trakcie', value: 'in_progress' },
          { label: 'Oczekujące', value: 'waiting' },
          { label: 'Rozwiązane', value: 'resolved' },
          { label: 'Zamknięte', value: 'closed' }
        ]"
        class="w-40"
      />
      <USelect
        v-model="priorityFilter"
        :items="[
          { label: 'Wszystkie priorytety', value: 'all' },
          { label: 'Niski', value: 'low' },
          { label: 'Normalny', value: 'normal' },
          { label: 'Wysoki', value: 'high' },
          { label: 'Krytyczny', value: 'urgent' }
        ]"
        class="w-44"
      />
    </div>

    <AppDataTable
      :data="filteredRows"
      :columns="columns"
      :loading="status === 'pending'"
      :row-context-items="rowContextItems"
    />

    <!-- Create slideover -->
    <USlideover v-model:open="open">
      <template #header>
        <h2 class="font-semibold">
          Nowe zgłoszenie
        </h2>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="create"
      >
        <UFormGroup label="Temat" name="subject" required>
          <UInput v-model="state.subject" />
        </UFormGroup>
        <UFormGroup label="Klient" name="customerId" required>
          <USelect
            v-model="state.customerId"
            :items="customerItems"
            searchable
            placeholder="Wybierz klienta"
          />
        </UFormGroup>
        <UFormGroup label="Priorytet" name="priority">
          <USelect
            v-model="state.priority"
            :items="[
              { label: 'Niski', value: 'low' },
              { label: 'Normalny', value: 'normal' },
              { label: 'Wysoki', value: 'high' },
              { label: 'Krytyczny', value: 'urgent' }
            ]"
          />
        </UFormGroup>
        <UFormGroup label="Kategoria" name="categoryId">
          <USelect
            v-model="state.categoryId"
            :items="categoryItems"
            placeholder="Wybierz kategorię"
            clearable
          />
        </UFormGroup>
        <UFormGroup label="Przypisz do" name="assignedTo">
          <UInput v-model="state.assignedTo" placeholder="Nazwa osoby" />
        </UFormGroup>
        <UFormGroup label="Treść zgłoszenia" name="message" required>
          <UTextarea v-model="state.message" :rows="6" />
        </UFormGroup>
        <UButton
          type="submit"
          color="primary"
          label="Utwórz zgłoszenie"
          class="w-full"
        />
      </UForm>
    </USlideover>
  </UDashboardPanel>
</template>

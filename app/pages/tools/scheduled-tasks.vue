<script setup lang="ts">
interface TaskRow {
  id: string
  title: string
  description: string | null
  taskType: string
  targetEntity: string | null
  targetEntityId: string | null
  config: unknown
  cronExpression: string | null
  scheduledAt: string | null
  completedAt: string | null
  status: string
  assignedTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const toast = useToast()
const tasks = ref<TaskRow[]>([])
const loading = ref(true)
const statusFilter = ref('')

async function load() {
  loading.value = true
  try {
    const query: Record<string, string> = {}
    if (statusFilter.value) query.status = statusFilter.value
    const res = await $fetch<{ success: boolean, data: TaskRow[] }>('/api/system/scheduled-tasks', { query })
    tasks.value = res.data
  } catch {
    toast.add({ title: 'Błąd ładowania zadań', color: 'error' })
  } finally {
    loading.value = false
  }
}

watch(statusFilter, load)
onMounted(load)

function statusColor(status: string) {
  const map: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    completed: 'success',
    pending: 'warning',
    running: 'neutral',
    failed: 'error',
    cancelled: 'neutral'
  }
  return map[status] || 'neutral'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Oczekujące',
    running: 'W trakcie',
    completed: 'Zakończone',
    failed: 'Nieudane',
    cancelled: 'Anulowane'
  }
  return map[status] || status
}
</script>

<template>
  <UDashboardPanel id="scheduled-tasks" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Zaplanowane zadania">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Odśwież" icon="i-lucide-refresh-cw" variant="subtle" @click="load" />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Wszystkie', value: '' },
              { label: 'Oczekujące', value: 'pending' },
              { label: 'W trakcie', value: 'running' },
              { label: 'Zakończone', value: 'completed' },
              { label: 'Nieudane', value: 'failed' }
            ]"
            class="min-w-40"
          />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span i-lucide-loader-circle animate-spin class="size-6 text-muted" />
      </div>
      <div v-else-if="!tasks.length" class="flex flex-col items-center justify-center py-20 text-muted">
        <span i-lucide-calendar-clock class="size-8 mb-2" />
        <p>Brak zaplanowanych zadań</p>
      </div>
      <UTable v-else :data="tasks" class="w-full">
        <template #columns>
          <UTableColumn header="Data" accessor-key="scheduledAt" class="w-36">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ row.scheduledAt ? new Date(row.scheduledAt).toLocaleString('pl-PL') : '-' }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="Tytuł" accessor-key="title" />
          <UTableColumn header="Typ" accessor-key="taskType" class="w-32" />
          <UTableColumn header="Status" accessor-key="status" class="w-28">
            <template #default="{ row }">
              <UBadge :color="statusColor(row.status)" variant="subtle" size="sm">{{ statusLabel(row.status) }}</UBadge>
            </template>
          </UTableColumn>
          <UTableColumn header="Przypisane" accessor-key="assignedTo" class="w-32">
            <template #default="{ row }">
              {{ row.assignedTo || '-' }}
            </template>
          </UTableColumn>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface EmailLogRow {
  id: string
  to: string
  fromEmail: string
  subject: string
  bodyExcerpt?: string | null
  status: 'pending' | 'sent' | 'failed' | string
  error?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  sentAt?: string | null
  createdAt: string
  template?: { id: number, name: string } | null
}

const query = ref('')
const statusFilter = ref<string | undefined>(undefined)

const statusOptions = [
  { label: 'Wszystkie', value: undefined },
  { label: 'Wysłane', value: 'sent' },
  { label: 'Błędy', value: 'failed' },
  { label: 'Oczekujące', value: 'pending' }
]

const { data, status, refresh } = await useFetch<{ success: boolean, data: EmailLogRow[] }>('/api/notifications/logs', {
  query: { status: statusFilter },
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(row => [row.to, row.fromEmail, row.subject, row.template?.name, row.relatedEntityType, row.error]
    .some(value => value?.toLowerCase().includes(q)))
})

const columns: TableColumn<EmailLogRow>[] = [
  { accessorKey: 'createdAt', header: 'Data' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'to', header: 'Do' },
  { accessorKey: 'subject', header: 'Temat' },
  { accessorKey: 'template.name', header: 'Szablon' },
  { accessorKey: 'relatedEntityType', header: 'Obiekt' }
]

function statusColor(value: string) {
  if (value === 'sent') return 'success'
  if (value === 'failed') return 'error'
  return 'warning'
}

function statusLabel(value: string) {
  if (value === 'sent') return 'Wysłane'
  if (value === 'failed') return 'Błąd'
  if (value === 'pending') return 'Oczekujące'
  return value
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('pl-PL') : '—'
}
</script>

<template>
  <UDashboardPanel id="notifications-logs">
    <template #header>
      <UDashboardNavbar title="Logi e-mail">
        <template #leading>
          <UButton
            to="/notifications"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
          />
        </template>
        <template #right>
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-refresh-cw"
            label="Odśwież"
            @click="() => refresh()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <UDashboardToolbar>
      <template #left>
        <UDashboardSearch v-model="query" placeholder="Szukaj logów..." />
      </template>
      <template #right>
        <USelect v-model="statusFilter" :items="statusOptions" class="w-44" />
      </template>
    </UDashboardToolbar>

    <AppDataTable :data="rows" :columns="columns" :loading="status === 'pending'">
      <template #cell-createdAt="{ row }">
        {{ formatDate(row.original.createdAt) }}
      </template>
      <template #cell-status="{ row }">
        <UBadge :color="statusColor(row.original.status)" variant="soft">
          {{ statusLabel(row.original.status) }}
        </UBadge>
      </template>
      <template #cell-template-name="{ row }">
        {{ row.original.template?.name || '—' }}
      </template>
      <template #cell-relatedEntityType="{ row }">
        <div class="text-sm">
          <div>{{ row.original.relatedEntityType || '—' }}</div>
          <div v-if="row.original.relatedEntityId" class="text-muted truncate max-w-48">
            {{ row.original.relatedEntityId }}
          </div>
        </div>
      </template>
    </AppDataTable>
  </UDashboardPanel>
</template>

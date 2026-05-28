<script setup lang="ts">
const route = useRoute()
const toast = useToast()

interface TicketMessage {
  id: string
  author: string
  content: string
  isInternal: boolean
  attachments: Array<{ filename: string, url: string }> | null
  createdAt: string
}

interface TicketDetail {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  assignedTo: string | null
  customer: { id: string, fullName: string } | null
  category: { id: number, name: string } | null
  messages: TicketMessage[]
}

const { data, refresh } = await useFetch<{ success: boolean, data: TicketDetail }>(
  `/api/helpdesk/tickets/${route.params.id}`,
  { default: () => ({ success: false, data: {} as TicketDetail }) }
)

const newAuthor = ref('')
const newContent = ref('')
const newIsInternal = ref(false)
const sending = ref(false)

const editingStatus = ref(false)
const newStatus = ref('')

const statusLabels: Record<string, string> = {
  open: 'Otwarte',
  in_progress: 'W trakcie',
  waiting: 'Oczekujące',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte'
}

const statusColors = {
  open: 'warning',
  in_progress: 'info',
  waiting: 'warning',
  resolved: 'success',
  closed: 'neutral'
} as const

function statusColor(status: string) {
  return status in statusColors ? statusColors[status as keyof typeof statusColors] : 'neutral'
}

async function sendMessage() {
  if (!newAuthor.value.trim() || !newContent.value.trim()) return
  sending.value = true
  try {
    await $fetch(`/api/helpdesk/tickets/${route.params.id}/messages`, {
      method: 'POST',
      body: {
        author: newAuthor.value,
        content: newContent.value,
        isInternal: newIsInternal.value
      }
    })
    newAuthor.value = ''
    newContent.value = ''
    newIsInternal.value = false
    refresh()
  } finally {
    sending.value = false
  }
}

async function changeStatus() {
  if (!newStatus.value) return
  try {
    await $fetch(`/api/helpdesk/tickets/${route.params.id}`, {
      method: 'PATCH',
      body: { status: newStatus.value }
    })
    toast.add({ title: 'Status zaktualizowany', color: 'success' })
    editingStatus.value = false
    refresh()
  } catch {
    toast.add({ title: 'Błąd aktualizacji', color: 'error' })
  }
}

async function updateField(field: string, value: unknown) {
  try {
    await $fetch(`/api/helpdesk/tickets/${route.params.id}`, {
      method: 'PATCH',
      body: { [field]: value }
    })
    refresh()
  } catch {
    toast.add({ title: `Błąd aktualizacji ${field}`, color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="helpdesk-detail" :ui="{ body: 'p-0 gap-0' }">
    <template #header>
      <UDashboardNavbar :title="data.data?.subject || 'Ładowanie...'">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            to="/helpdesk/tickets"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
          />
        </template>
        <template #right>
          <UBadge v-if="data.data" :color="statusColor(data.data.status)">
            {{ statusLabels[data.data.status] || data.data.status }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <div v-if="data.data" class="flex flex-1 overflow-hidden">
      <!-- Main content: messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-for="msg in data.data.messages" :key="msg.id" class="flex gap-3">
          <div class="flex-1">
            <UCard>
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-sm">{{ msg.author }}</span>
                <span class="text-xs text-muted">{{ new Date(msg.createdAt).toLocaleString('pl-PL') }}</span>
                <UBadge
                  v-if="msg.isInternal"
                  size="xs"
                  color="warning"
                  label="Wewnętrzna"
                />
              </div>
              <p class="text-sm whitespace-pre-wrap">
                {{ msg.content }}
              </p>
            </UCard>
          </div>
        </div>

        <!-- Add message form -->
        <UCard>
          <template #header>
            <h3 class="font-medium text-sm">
              Dodaj wiadomość
            </h3>
          </template>
          <div class="space-y-3">
            <UFormGroup label="Autor" required>
              <UInput v-model="newAuthor" placeholder="Twoja nazwa" />
            </UFormGroup>
            <UFormGroup label="Treść" required>
              <UTextarea v-model="newContent" :rows="4" placeholder="Treść wiadomości..." />
            </UFormGroup>
            <UCheckbox v-model="newIsInternal" label="Wewnętrzna (niewidoczna dla klienta)" />
            <UButton
              label="Wyślij"
              color="primary"
              size="sm"
              :loading="sending"
              :disabled="!newAuthor.trim() || !newContent.trim()"
              @click="sendMessage"
            />
          </div>
        </UCard>
      </div>

      <!-- Side panel -->
      <div class="w-72 border-l p-4 space-y-4 overflow-y-auto">
        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Klient
          </h4>
          <NuxtLink v-if="data.data.customer" :to="`/crm/customers/${data.data.customer.id}`" class="text-sm text-primary hover:underline">
            {{ data.data.customer.fullName }}
          </NuxtLink>
          <p v-else class="text-sm text-muted">
            Brak
          </p>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Kategoria
          </h4>
          <p class="text-sm">
            {{ data.data.category?.name || 'Brak' }}
          </p>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Priorytet
          </h4>
          <USelect
            :model-value="data.data.priority"
            :items="[
              { label: 'Niski', value: 'low' },
              { label: 'Normalny', value: 'normal' },
              { label: 'Wysoki', value: 'high' },
              { label: 'Krytyczny', value: 'urgent' }
            ]"
            size="sm"
            @update:model-value="(v: string) => updateField('priority', v)"
          />
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Status
          </h4>
          <div class="flex items-center gap-2">
            <USelect
              v-if="editingStatus"
              v-model="newStatus"
              :items="[
                { label: 'Otwarte', value: 'open' },
                { label: 'W trakcie', value: 'in_progress' },
                { label: 'Oczekujące', value: 'waiting' },
                { label: 'Rozwiązane', value: 'resolved' },
                { label: 'Zamknięte', value: 'closed' }
              ]"
              size="sm"
            />
            <UButton
              v-if="editingStatus"
              size="xs"
              color="primary"
              icon="i-lucide-check"
              @click="changeStatus"
            />
            <UButton
              v-else
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="editingStatus = true; newStatus = data.data.status"
            />
          </div>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Przypisane do
          </h4>
          <UInput
            :model-value="data.data.assignedTo || ''"
            placeholder="Nieprzypisane"
            size="sm"
            @update:model-value="(v: string) => updateField('assignedTo', v || null)"
          />
        </div>

        <div>
          <h4 class="text-xs font-semibold text-muted uppercase mb-2">
            Utworzono
          </h4>
          <p class="text-sm">
            {{ new Date(data.data.createdAt).toLocaleString('pl-PL') }}
          </p>
        </div>
      </div>
    </div>
  </UDashboardPanel>
</template>

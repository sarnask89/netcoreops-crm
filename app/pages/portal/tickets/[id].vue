<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

interface TicketMessage {
  id: string
  author: string
  content: string
  isInternal: boolean
  createdAt: string
}

interface TicketDetail {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  category: { id: number, name: string } | null
  messages: TicketMessage[]
}

const { data, status, refresh } = await useFetch<{ success: boolean, data: TicketDetail }>(
  `/api/portal/helpdesk/tickets/${route.params.id}`,
  { default: () => ({ success: false, data: {} as TicketDetail }) }
)

const newMessage = ref('')
const sending = ref(false)

async function sendMessage() {
  if (!newMessage.value.trim()) return
  sending.value = true
  try {
    await $fetch(`/api/portal/helpdesk/tickets/${route.params.id}/messages`, {
      method: 'POST',
      body: { content: newMessage.value }
    })
    newMessage.value = ''
    refresh()
  } finally {
    sending.value = false
  }
}

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

const statusLabels: Record<string, string> = {
  open: 'Otwarte',
  in_progress: 'W trakcie',
  waiting: 'Oczekujące',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte'
}

const priorityLabels: Record<string, string> = {
  low: 'Niski',
  normal: 'Normalny',
  high: 'Wysoki',
  urgent: 'Krytyczny'
}
</script>

<template>
  <main class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UButton
            to="/portal/tickets"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-left"
          />
          <h1 class="font-semibold text-base truncate max-w-md">
            {{ data.data?.subject || 'Zgłoszenie' }}
          </h1>
        </div>
        <UButton
          label="Wyloguj"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-log-out"
          @click="logout"
        />
      </div>
    </header>

    <div v-if="status === 'success'" class="max-w-5xl mx-auto px-4 py-6">
      <!-- Ticket header -->
      <UCard class="mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-700/50">
            {{ statusLabels[data.data.status] || data.data.status }}
          </span>
          <span class="text-xs text-muted">
            Priorytet: {{ priorityLabels[data.data.priority] || data.data.priority }}
          </span>
          <span v-if="data.data.category" class="text-xs text-muted">
            Kategoria: {{ data.data.category.name }}
          </span>
          <span class="text-xs text-muted">
            Utworzono: {{ new Date(data.data.createdAt).toLocaleDateString('pl-PL') }}
          </span>
        </div>
      </UCard>

      <!-- Messages -->
      <div class="space-y-4 mb-6">
        <div v-for="msg in data.data.messages" :key="msg.id" class="flex gap-3">
          <div class="flex-1">
            <UCard>
              <div class="flex items-center gap-2 mb-2 text-sm">
                <span class="font-medium">{{ msg.author }}</span>
                <span class="text-xs text-muted">{{ new Date(msg.createdAt).toLocaleString('pl-PL') }}</span>
              </div>
              <p class="text-sm whitespace-pre-wrap">
                {{ msg.content }}
              </p>
            </UCard>
          </div>
        </div>
      </div>

      <!-- New message form -->
      <div v-if="data.data.status !== 'closed' && data.data.status !== 'resolved'">
        <UCard>
          <UFormGroup label="Dodaj odpowiedź">
            <UTextarea v-model="newMessage" :rows="4" placeholder="Treść wiadomości..." />
          </UFormGroup>
          <div class="mt-3">
            <UButton
              label="Wyślij"
              color="primary"
              size="sm"
              :loading="sending"
              :disabled="!newMessage.trim()"
              @click="sendMessage"
            />
          </div>
        </UCard>
      </div>
      <div v-else class="text-center py-6 text-muted text-sm">
        To zgłoszenie jest zamknięte
      </div>
    </div>
  </main>
</template>

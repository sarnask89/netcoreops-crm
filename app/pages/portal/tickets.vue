<script setup lang="ts">
definePageMeta({ layout: false })

interface TicketRow {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  category: { id: number, name: string } | null
}

const { data } = await useFetch<{ success: boolean, data: TicketRow[] }>('/api/portal/helpdesk/tickets', {
  default: () => ({ success: false, data: [] }),
  onResponseError: () => navigateTo('/portal/login')
})

const creating = ref(false)
const subject = ref('')
const message = ref('')
const categoryId = ref<number | undefined>(undefined)
const priority = ref('normal')
const submitting = ref(false)

const { data: categoriesData } = await useFetch<{ success: boolean, data: Array<{ id: number, name: string }> }>('/api/portal/helpdesk/categories', {
  default: () => ({ success: false, data: [] })
})

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

async function createTicket() {
  if (!subject.value.trim() || !message.value.trim()) return
  submitting.value = true
  try {
    await $fetch('/api/portal/helpdesk/tickets', {
      method: 'POST',
      body: {
        subject: subject.value,
        message: message.value,
        categoryId: categoryId.value,
        priority: priority.value
      }
    })
    creating.value = false
    subject.value = ''
    message.value = ''
    categoryId.value = undefined
    priority.value = 'normal'
    refresh()
  } finally {
    submitting.value = false
  }
}

const { data: freshData, refresh } = useFetch<{ success: boolean, data: TicketRow[] }>('/api/portal/helpdesk/tickets', {
  default: () => ({ success: false, data: [] }),
  immediate: false
})

const tickets = computed(() => freshData.value?.success ? freshData.value.data : data.value.data)

const statusColors: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  waiting: 'bg-orange-500/10 text-orange-500',
  resolved: 'bg-green-500/10 text-green-500',
  closed: 'bg-gray-500/10 text-gray-500'
}

const statusLabels: Record<string, string> = {
  open: 'Otwarte',
  in_progress: 'W trakcie',
  waiting: 'Oczekujące',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte'
}
</script>

<template>
  <main class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UButton
            to="/portal"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-left"
          />
          <h1 class="font-semibold text-base">
            Moje zgłoszenia
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

    <div class="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <div class="flex justify-between items-center">
        <p class="text-sm text-muted">
          {{ tickets.length }} zgłoszeń
        </p>
        <UButton
          label="Nowe zgłoszenie"
          color="primary"
          size="sm"
          @click="creating = true"
        />
      </div>

      <!-- Create ticket slideover -->
      <USlideover v-model:open="creating">
        <template #header>
          <h2 class="font-semibold">
            Nowe zgłoszenie
          </h2>
        </template>
        <div class="p-4 space-y-4">
          <UFormGroup label="Temat" required>
            <UInput v-model="subject" placeholder="Krótki opis problemu" />
          </UFormGroup>
          <UFormGroup label="Kategoria">
            <USelect
              v-model="categoryId"
              :items="categoriesData.data?.map(c => ({ label: c.name, value: c.id })) || []"
              placeholder="Wybierz kategorię"
              clearable
            />
          </UFormGroup>
          <UFormGroup label="Priorytet">
            <USelect
              v-model="priority"
              :items="[
                { label: 'Niski', value: 'low' },
                { label: 'Normalny', value: 'normal' },
                { label: 'Wysoki', value: 'high' },
                { label: 'Krytyczny', value: 'urgent' }
              ]"
            />
          </UFormGroup>
          <UFormGroup label="Opis problemu" required>
            <UTextarea v-model="message" :rows="6" placeholder="Szczegółowy opis..." />
          </UFormGroup>
          <UButton
            label="Wyślij"
            color="primary"
            :loading="submitting"
            :disabled="!subject.trim() || !message.trim()"
            class="w-full"
            @click="createTicket"
          />
        </div>
      </USlideover>

      <!-- Ticket list -->
      <div v-if="tickets.length === 0" class="text-center py-12 text-muted">
        Brak zgłoszeń
      </div>

      <div v-for="ticket in tickets" :key="ticket.id" class="group">
        <NuxtLink :to="`/portal/tickets/${ticket.id}`" class="block">
          <UCard class="hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="font-medium truncate">{{ ticket.subject }}</h3>
                <p class="text-xs text-muted mt-1">
                  {{ ticket.category?.name || 'Bez kategorii' }} &middot; {{ new Date(ticket.createdAt).toLocaleDateString('pl-PL') }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span :class="`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status] || ''}`">
                  {{ statusLabels[ticket.status] || ticket.status }}
                </span>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

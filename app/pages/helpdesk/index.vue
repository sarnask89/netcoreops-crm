<script setup lang="ts">
interface TicketSummary {
  id: string
  status: string
  priority: string
  totalGross: never
}

const { data } = await useFetch<{ success: boolean, data: TicketSummary[] }>('/api/helpdesk/tickets', {
  default: () => ({ success: false, data: [] })
})

const stats = computed(() => {
  const tickets = data.value.data || []
  return {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    waiting: tickets.filter(t => t.status === 'waiting').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length,
    total: tickets.length
  }
})
</script>

<template>
  <UDashboardPanel id="helpdesk-index" :ui="{ body: 'p-6 sm:p-6 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Helpdesk">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton to="/helpdesk/tickets" color="primary" label="Zgłoszenia" />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-circle-alert" class="text-yellow-500" />
            <span>Otwarte</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.open }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-arrow-up-circle" class="text-blue-500" />
            <span>W trakcie</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.inProgress }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-alert-triangle" class="text-red-500" />
            <span>Pilne</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.urgent }}
        </p>
      </UCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-clock" class="text-orange-500" />
            <span>Oczekujące</span>
          </div>
        </template>
        <p class="text-2xl font-bold">
          {{ stats.waiting }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-check-circle" class="text-green-500" />
            <span>Rozwiązane</span>
          </div>
        </template>
        <p class="text-2xl font-bold">
          {{ stats.resolved }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-ticket" class="text-muted" />
            <span>Wszystkie</span>
          </div>
        </template>
        <p class="text-2xl font-bold">
          {{ stats.total }}
        </p>
      </UCard>
    </div>
  </UDashboardPanel>
</template>

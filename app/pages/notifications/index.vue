<script setup lang="ts">
interface LogStats {
  totalSent: number
  totalFailed: number
  totalPending: number
  total: number
}

const { data: resp } = await useFetch<{ success: boolean, data: LogStats }>('/api/notifications/logs/stats', {
  default: () => ({ success: false, data: { totalSent: 0, totalFailed: 0, totalPending: 0, total: 0 } })
})
const stats = computed(() => resp.value.data)
</script>

<template>
  <UDashboardPanel id="notifications-index">
    <template #header>
      <UDashboardNavbar title="Powiadomienia e-mail">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton to="/notifications/smtp" color="primary" label="Konfiguracja SMTP" />
          <UButton
            to="/notifications/templates"
            color="primary"
            label="Szablony"
            variant="outline"
          />
          <UButton
            to="/notifications/logs"
            color="primary"
            label="Logi"
            variant="outline"
          />
          <UButton
            to="/notifications/rules"
            color="primary"
            label="Reguły"
            variant="outline"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-send" class="text-primary" />
            <span>Wysłane</span>
          </div>
        </template>
        <p class="text-3xl font-bold text-green-600">
          {{ stats.totalSent }}
        </p>
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-clock" class="text-warning" />
            <span>Oczekujące</span>
          </div>
        </template>
        <p class="text-3xl font-bold text-amber-600">
          {{ stats.totalPending }}
        </p>
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-alert-circle" class="text-error" />
            <span>Błędy</span>
          </div>
        </template>
        <p class="text-3xl font-bold text-red-600">
          {{ stats.totalFailed }}
        </p>
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-inbox" />
            <span>Wszystkie</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.total }}
        </p>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="text-lg font-semibold">
          Konfiguracja
        </div>
      </template>
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          Skonfiguruj serwer SMTP, utwórz szablony e-mail i zdefiniuj reguły powiadomień.
        </p>
        <div class="flex gap-3">
          <UButton
            to="/notifications/smtp"
            color="primary"
            label="Konfiguracja SMTP"
            icon="i-lucide-settings"
          />
          <UButton
            to="/notifications/templates"
            color="primary"
            label="Szablony"
            variant="outline"
            icon="i-lucide-file-text"
          />
          <UButton
            to="/notifications/logs"
            color="primary"
            label="Logi e-mail"
            variant="outline"
            icon="i-lucide-list-checks"
          />
          <UButton
            to="/notifications/rules"
            color="primary"
            label="Reguły"
            variant="outline"
            icon="i-lucide-bell"
          />
        </div>
      </div>
    </UCard>
  </UDashboardPanel>
</template>

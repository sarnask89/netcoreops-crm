<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [[{
  label: 'Konto',
  icon: 'i-lucide-user',
  to: '/settings',
  exact: true
}, {
  label: 'Użytkownicy',
  icon: 'i-lucide-users',
  to: '/settings/members'
}, {
  label: 'Powiadomienia',
  icon: 'i-lucide-bell',
  to: '/settings/notifications'
}, {
  label: 'Bezpieczeństwo',
  icon: 'i-lucide-shield',
  to: '/settings/security'
}]] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Ustawienia">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>

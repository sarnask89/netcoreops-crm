<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useThemeSkin } from '~/composables/useThemeSkin'

interface SearchItem {
  label: string
  icon?: string
  to?: string
  onSelect?: () => void
  suffix?: string
  target?: string
}

interface SearchGroup {
  id: string
  label: string
  items: SearchItem[]
}

const open = ref(false)
const searchTerm = ref('')
const databaseSearchItems = ref<SearchItem[]>([])

const links = [[{
  label: 'Pulpit',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Sieć',
  icon: 'i-lucide-network',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: 'Węzły',
    icon: 'i-lucide-map-pin',
    to: '/network/nodes',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Linie',
    icon: 'i-lucide-route',
    to: '/network/lines',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Urządzenia',
    icon: 'i-lucide-server',
    to: '/network/equipment',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH / GPON',
    icon: 'i-lucide-git-branch',
    to: '/network/ftth',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH OLT',
    icon: 'i-lucide-server',
    to: '/network/ftth/olts',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH PON',
    icon: 'i-lucide-git-fork',
    to: '/network/ftth/pons',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH ONU',
    icon: 'i-lucide-router',
    to: '/network/ftth/onus',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH MAC map',
    icon: 'i-lucide-link',
    to: '/network/ftth/mac-map',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH importy',
    icon: 'i-lucide-database-zap',
    to: '/network/ftth/imports',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'FTTH diagnostyka',
    icon: 'i-lucide-radar',
    to: '/network/ftth/diagnostics',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Importy',
    icon: 'i-lucide-database-zap',
    to: '/network/imports',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Profile dostępowe',
    icon: 'i-lucide-sliders-horizontal',
    to: '/network/access-profiles',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Topologia',
    icon: 'i-lucide-network',
    to: '/network/topology',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Mapa klientów',
    icon: 'i-lucide-map-pinned',
    to: '/network/customer-map',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'CRM',
  icon: 'i-lucide-users',
  type: 'trigger',
  children: [{
    label: 'Klienci',
    icon: 'i-lucide-user-round',
    to: '/crm/customers',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Urządzenia klienta',
    icon: 'i-lucide-router',
    to: '/crm/customer-devices',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Billing',
  icon: 'i-lucide-receipt',
  type: 'trigger',
  children: [{
    label: 'Taryfy',
    icon: 'i-lucide-list-checks',
    to: '/billing/tariffs',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Przypisania',
    icon: 'i-lucide-badge-dollar-sign',
    to: '/billing/assignments',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Finanse',
  icon: 'i-lucide-banknote',
  type: 'trigger',
  children: [{
    label: 'Faktury',
    icon: 'i-lucide-file-text',
    to: '/finance/documents',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Płatności',
    icon: 'i-lucide-banknote',
    to: '/finance/payments',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Plany numeracji',
    icon: 'i-lucide-sort-asc',
    to: '/finance/number-plans',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Helpdesk',
  icon: 'i-lucide-life-buoy',
  type: 'trigger',
  children: [{
    label: 'Zgłoszenia',
    icon: 'i-lucide-ticket',
    to: '/helpdesk/tickets',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Kategorie',
    icon: 'i-lucide-tags',
    to: '/helpdesk/categories',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Powiadomienia',
  icon: 'i-lucide-bell',
  type: 'trigger',
  children: [{
    label: 'Przegląd',
    icon: 'i-lucide-layout-dashboard',
    to: '/notifications',
    onSelect: () => { open.value = false }
  }, {
    label: 'Konfiguracja SMTP',
    icon: 'i-lucide-settings',
    to: '/notifications/smtp',
    onSelect: () => { open.value = false }
  }, {
    label: 'Szablony e-mail',
    icon: 'i-lucide-file-text',
    to: '/notifications/templates',
    onSelect: () => { open.value = false }
  }, {
    label: 'Logi e-mail',
    icon: 'i-lucide-list-checks',
    to: '/notifications/logs',
    onSelect: () => { open.value = false }
  }, {
    label: 'Reguły powiadomień',
    icon: 'i-lucide-bell-plus',
    to: '/notifications/rules',
    onSelect: () => { open.value = false }
  }]
}, {
  label: 'Automatyzacja',
  icon: 'i-lucide-terminal-square',
  type: 'trigger',
  children: [{
    label: 'Skrypty',
    icon: 'i-lucide-file-terminal',
    to: '/automation/scripts',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Definicje zmiennych',
    icon: 'i-lucide-braces',
    to: '/automation/definitions',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Narzędzia',
  icon: 'i-lucide-wrench',
  type: 'trigger',
  children: [{
    label: 'Generator modułów',
    icon: 'i-lucide-blocks',
    to: '/tools/module-generator',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Dziennik audytu',
    icon: 'i-lucide-shield',
    to: '/tools/audit-log',
    onSelect: () => { open.value = false }
  }, {
    label: 'Kopie zapasowe',
    icon: 'i-lucide-database-backup',
    to: '/tools/backups',
    onSelect: () => { open.value = false }
  }, {
    label: 'Zaplanowane zadania',
    icon: 'i-lucide-calendar-clock',
    to: '/tools/scheduled-tasks',
    onSelect: () => { open.value = false }
  }, {
    label: 'Syslog',
    icon: 'i-lucide-log-in',
    to: '/tools/syslog',
    onSelect: () => { open.value = false }
  }]
}, {
  label: 'Słowniki UKE',
  icon: 'i-lucide-book-open',
  to: '/system/dictionaries',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Walidacja PIT',
  icon: 'i-lucide-shield-check',
  to: '/pit/validation',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Katalog wyszukiwarki',
  icon: 'i-lucide-search',
  to: '/system/search-catalog',
  onSelect: () => {
    open.value = false
  }
}], [{
  label: 'Eksport CSV',
  icon: 'i-lucide-download',
  to: '/api/pit/export',
  target: '_blank'
}, {
  label: 'BIP UKE art. 20',
  icon: 'i-lucide-external-link',
  to: 'https://bip.uke.gov.pl/sprawozdania/obowiazek-sprawozdawczy-z-art-20-pke/',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

const flatLinks = computed<SearchItem[]>(() => flattenNavigationItems(links.flat()))
const groups = computed<SearchGroup[]>(() => {
  const baseGroups: SearchGroup[] = [{
    id: 'links',
    label: 'Nawigacja',
    items: flatLinks.value
  }, {
    id: 'pit',
    label: 'PIT/UKE',
    items: flatLinks.value
  }]

  if (!searchTerm.value.startsWith('@')) {
    return baseGroups
  }

  return [{
    id: 'database',
    label: 'Baza i funkcje',
    items: databaseSearchItems.value
  }, ...baseGroups]
})

const debouncedSearch = useDebounceFn(async (term: string) => {
  try {
    const response = await $fetch<{ success: boolean, data: SearchItem[] }>('/api/search', {
      query: { q: term }
    })

    if (term !== searchTerm.value) {
      return
    }

    databaseSearchItems.value = response.data.map(item => ({
      ...item,
      onSelect: () => {
        open.value = false
      }
    }))
  } catch {
    if (term === searchTerm.value) {
      databaseSearchItems.value = []
    }
  }
}, 150)

watch(searchTerm, (value) => {
  if (!value.startsWith('@') || value.length < 2) {
    databaseSearchItems.value = []
    return
  }

  debouncedSearch(value)
})

const { isDashboard } = useThemeSkin()
const { isNotificationsSlideoverOpen } = useDashboard()

function flattenNavigationItems(items: NavigationMenuItem[]): SearchItem[] {
  return items.flatMap((item) => {
    if (item.children?.length) {
      return flattenNavigationItems(item.children as NavigationMenuItem[])
    }

    return [{
      label: item.label || '',
      icon: typeof item.icon === 'string' ? item.icon : undefined,
      to: typeof item.to === 'string' ? item.to : undefined,
      target: typeof item.target === 'string' ? item.target : undefined,
      onSelect: item.onSelect ? () => item.onSelect?.(new Event('select')) : undefined
    }]
  })
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ body: 'scrollbar-none', footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton v-if="!isDashboard" :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch v-model:search-term="searchTerm" :groups="groups" />

    <div v-if="isDashboard" class="flex flex-col flex-1 min-w-0">
      <div class="flex items-center gap-3 px-6 py-2.5 border-b border-default bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <UDashboardSearchButton class="bg-transparent ring-default flex-1 max-w-sm" />
        <div class="flex items-center gap-1 ml-auto">
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            square
            @click="isNotificationsSlideoverOpen = true"
          />
        </div>
      </div>
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
    <template v-else>
      <slot />
    </template>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>

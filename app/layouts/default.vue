<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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
let searchTimer: ReturnType<typeof setTimeout> | undefined

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

watch(searchTerm, (value) => {
  if (searchTimer) clearTimeout(searchTimer)

  if (!value.startsWith('@') || value.length < 2) {
    databaseSearchItems.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    const response = await $fetch<{ success: boolean, data: SearchItem[] }>('/api/search', {
      query: { q: value }
    })
    databaseSearchItems.value = response.data.map(item => ({
      ...item,
      onSelect: () => {
        open.value = false
      }
    }))
  }, 150)
})

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
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

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

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>

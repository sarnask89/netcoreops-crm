<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ThemeSkin } from '~/composables/useThemeSkin'
import { SKINS, useThemeSkin } from '~/composables/useThemeSkin'

defineProps<{
  collapsed?: boolean
}>()

interface LocalAccount {
  username: string
  name: string
  role: string
  email: string
  host: string
}

const colorMode = useColorMode()
const appConfig = useAppConfig()
const { currentSkin, selectSkin } = useThemeSkin()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const { data: account } = await useFetch<{ success: boolean, data: LocalAccount }>('/api/account/me', {
  default: () => ({
    success: true,
    data: {
      username: 'admin',
      name: 'Administrator',
      role: 'Administrator lokalny',
      email: 'admin@local.netcoreops',
      host: 'localhost'
    }
  })
})

const user = computed(() => {
  const name = account.value.data.name || account.value.data.username || 'Administrator'
  return {
    name,
    avatar: {
      alt: name
    }
  }
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar
}, {
  type: 'label',
  label: account.value.data.email
}, {
  type: 'label',
  label: `Host: ${account.value.data.host}`
}], [{
  label: 'Ustawienia konta',
  icon: 'i-lucide-settings',
  to: '/settings'
}, {
  label: 'Bezpieczeństwo',
  icon: 'i-lucide-shield-check',
  to: '/settings/security'
}], [{
  label: 'Skórka',
  icon: currentSkin.value.icon,
  chip: currentSkin.value.label,
  slot: 'chip',
  content: {
    align: 'end',
    collisionPadding: 16
  },
  children: (SKINS as ThemeSkin[]).map(skin => ({
    label: skin.label,
    icon: skin.icon,
    slot: 'chip',
    chip: skin.primary,
    description: skin.description,
    type: 'checkbox' as const,
    checked: currentSkin.value.id === skin.id,
    onSelect: (e: Event) => {
      e.preventDefault()
      selectSkin(skin.id)
    }
  }))
}, {
  label: 'Kolor główny',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Kolor główny',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color
      }
    }))
  }, {
    label: 'Kolor neutralny',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color === 'neutral' ? 'old-neutral' : color,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color
      }
    }))
  }]
}, {
  label: 'Wygląd',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Jasny',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()

      colorMode.preference = 'light'
    }
  }, {
    label: 'Ciemny',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    }
  }]
}], [{
  label: 'Sesja lokalna',
  icon: 'i-lucide-terminal',
  disabled: true
}, {
  label: 'Wyloguj',
  icon: 'i-lucide-log-out',
  onSelect: logout
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        avatar: user.avatar,
        label: collapsed ? undefined : user.name
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated justify-start"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    >
      <template v-if="!collapsed" #default>
        <div class="min-w-0 flex-1 text-left leading-tight">
          <div class="truncate font-medium">
            {{ user.name }}
          </div>
          <div class="truncate text-xs text-muted">
            {{ account.data.role }}
          </div>
        </div>
        <UIcon
          name="i-lucide-chevrons-up-down"
          class="size-4 shrink-0 text-dimmed"
        />
      </template>
    </UButton>

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>

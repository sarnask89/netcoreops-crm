import { createSharedComposable } from '@vueuse/core'

export interface ThemeSkin {
  id: string
  label: string
  icon: string
  description: string
  primary: string
  neutral: string
  mode: 'light' | 'dark' | 'system'
  /** Layout style:
   *  'sidebar'        – classic sidebar (current)
   *  'sidebar-compact' – narrower sidebar, less padding
   *  'dashboard'       – sidebar + header bar at top of content
   */
  style: 'sidebar' | 'sidebar-compact' | 'dashboard'
}

export const SKINS: ThemeSkin[] = [
  {
    id: 'nuxt-dashboard',
    label: 'Panel Nuxt UI',
    icon: 'i-lucide-palette',
    description: 'Jasny, czysty dashboard na wzór szablonu Nuxt UI',
    primary: 'blue',
    neutral: 'slate',
    mode: 'light',
    style: 'dashboard'
  },
  {
    id: 'classic',
    label: 'Klasyk',
    icon: 'i-lucide-sun',
    description: 'Jasny, stonowany fioletowo-beżowy',
    primary: 'indigo',
    neutral: 'stone',
    mode: 'light',
    style: 'sidebar'
  },
  {
    id: 'ocean',
    label: 'Oceaniczny',
    icon: 'i-lucide-waves',
    description: 'Ciemny, chłodny błękit morski',
    primary: 'cyan',
    neutral: 'cool',
    mode: 'dark',
    style: 'sidebar'
  },
  {
    id: 'sunset',
    label: 'Jesień',
    icon: 'i-lucide-sunset',
    description: 'Jasny, ciepły pomarańcz',
    primary: 'orange',
    neutral: 'stone',
    mode: 'light',
    style: 'dashboard'
  },
  {
    id: 'midnight',
    label: 'Noc',
    icon: 'i-lucide-moon-stars',
    description: 'Ciemny, głęboki fiolet',
    primary: 'purple',
    neutral: 'slate',
    mode: 'dark',
    style: 'sidebar'
  },
  {
    id: 'lavender',
    label: 'Lawenda',
    icon: 'i-lucide-flower-2',
    description: 'Jasny, delikatny fiolet lawendy',
    primary: 'violet',
    neutral: 'neutral',
    mode: 'light',
    style: 'sidebar'
  },
  {
    id: 'forest',
    label: 'Leśny',
    icon: 'i-lucide-tree-pine',
    description: 'Ciemna zieleń leśna, kompaktowy sidebar',
    primary: 'emerald',
    neutral: 'zinc',
    mode: 'dark',
    style: 'sidebar-compact'
  },
  {
    id: 'amber',
    label: 'Bursztyn',
    icon: 'i-lucide-sparkles',
    description: 'Jasny, bursztynowy akcent',
    primary: 'amber',
    neutral: 'warm',
    mode: 'light',
    style: 'dashboard'
  },
  {
    id: 'ruby',
    label: 'Rubin',
    icon: 'i-lucide-gem',
    description: 'Ciemny, szlachetny róż Rubinu',
    primary: 'rose',
    neutral: 'stone',
    mode: 'dark',
    style: 'sidebar'
  },
  {
    id: 'mint',
    label: 'Miętowy',
    icon: 'i-lucide-mountain-snow',
    description: 'Systemowy tryb, świeży miętowy akcent',
    primary: 'teal',
    neutral: 'slate',
    mode: 'system',
    style: 'sidebar'
  },
  {
    id: 'warmth',
    label: 'Ciepły',
    icon: 'i-lucide-home',
    description: 'Jasny, przytulny żółty',
    primary: 'yellow',
    neutral: 'stone',
    mode: 'light',
    style: 'sidebar'
  },
  {
    id: 'netcore-dark',
    label: 'Ciemny NetCore',
    icon: 'i-lucide-cloud-cog',
    description: 'Ciemny, znajomy domyślny NetCoreOps',
    primary: 'blue',
    neutral: 'slate',
    mode: 'dark',
    style: 'sidebar'
  }
]

const STORAGE_KEY = 'netcoreops-skin'

const _useThemeSkin = () => {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  const currentSkin = ref<ThemeSkin>(SKINS[0]!)

  const style = computed(() => currentSkin.value.style)
  const isDashboard = computed(() => style.value === 'dashboard')
  const isCompact = computed(() => style.value === 'sidebar-compact')

  function applySkin(skin: ThemeSkin) {
    currentSkin.value = skin
    // Apply color mode
    colorMode.preference = skin.mode
    // Apply primary & neutral colors
    if (appConfig.ui.colors) {
      appConfig.ui.colors.primary = skin.primary
      appConfig.ui.colors.neutral = skin.neutral as 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
    }
    // Set data attribute on <html> for CSS
    document.documentElement.dataset.skin = skin.id
    document.documentElement.dataset.skinStyle = skin.style
    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, skin.id)
    } catch {
      // localStorage may not be available during SSR
    }
  }

  function selectSkin(id: string) {
    const skin = SKINS.find(s => s.id === id)
    if (skin) {
      applySkin(skin)
    }
  }

  // Restore saved skin on init
  function initSkin() {
    const saved = import.meta.client ? localStorage.getItem(STORAGE_KEY) : null
    if (saved) {
      const skin = SKINS.find(s => s.id === saved)
      if (skin) {
        applySkin(skin)
        return
      }
    }
    // First run of skin system: always use light Nuxt UI dashboard skin
    // (ignores previous nuxt-color-mode preference to fix dark default)
    applySkin(SKINS[0]!)
  }

  return {
    skins: SKINS,
    currentSkin: readonly(currentSkin),
    style,
    isDashboard,
    isCompact,
    selectSkin,
    initSkin,
    applySkin
  }
}

export const useThemeSkin = /* @__PURE__ */ createSharedComposable(_useThemeSkin)

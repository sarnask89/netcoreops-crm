<script setup lang="ts">
import { useThemeSkin } from '~/composables/useThemeSkin'

const colorMode = useColorMode()
const { currentSkin, style, initSkin } = useThemeSkin()

onMounted(() => {
  initSkin()
})

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    'lang': 'en',
    'data-skin': computed(() => currentSkin.value.id),
    'data-skin-style': style
  }
})

const title = 'NetCoreOps CRM / PIT'
const description = 'Panel CRM i paszportyzacji sieci dla walidacji oraz eksportu danych PIT/UKE.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <SystemConsoleWidget />
  </UApp>
</template>

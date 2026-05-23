<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

defineProps<{
  title: string
  subtitle?: string
  item?: unknown
}>()
</script>

<template>
  <USlideover v-model:open="open" :title="title" :description="subtitle">
    <template #body>
      <pre class="max-h-[calc(100svh-10rem)] overflow-auto border border-muted bg-elevated p-4 text-xs leading-relaxed">{{ JSON.stringify(item, null, 2) }}</pre>
    </template>
  </USlideover>
</template>

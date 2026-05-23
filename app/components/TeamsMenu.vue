<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const instance = {
  label: 'NetCoreOps',
  description: 'CRM / FTTH / PIT',
  icon: 'i-lucide-network'
}
</script>

<template>
  <UButton
    :icon="instance.icon"
    :label="collapsed ? undefined : instance.label"
    :description="collapsed ? undefined : instance.description"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    :class="[!collapsed && 'py-2 justify-start']"
  />
</template>

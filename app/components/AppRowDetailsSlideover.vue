<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  subtitle?: string
  item?: unknown
}>()

const rawJson = computed(() => JSON.stringify(props.item, null, 2))

const hasContent = computed(() => props.item !== null && props.item !== undefined)

function isSimpleArray(arr: unknown[]): boolean {
  return !arr.some(item => item !== null && typeof item === 'object')
}
</script>

<template>
  <USlideover v-model:open="open" :title="title" :description="subtitle">
    <template #body>
      <!-- Empty state -->
      <div v-if="!hasContent" class="py-10 text-center text-sm text-muted">
        Brak danych do wyświetlenia
      </div>

      <!-- Array of primitives -->
      <div v-else-if="Array.isArray(item) && item.length > 0 && isSimpleArray(item)" class="max-h-[calc(100svh-16rem)] overflow-auto space-y-1">
        <div v-for="(val, idx) in item" :key="idx" class="text-sm text-default bg-elevated/50 px-3 py-2 rounded-sm">
          {{ val === null || val === undefined ? '—' : String(val) }}
        </div>
      </div>

      <!-- Array of objects -->
      <div v-else-if="Array.isArray(item) && item.length > 0" class="max-h-[calc(100svh-16rem)] overflow-auto space-y-4">
        <div v-for="(subItem, idx) in item" :key="idx" class="border border-default rounded-md overflow-hidden">
          <div class="bg-elevated/70 px-3 py-1.5 text-xs font-medium text-muted uppercase tracking-wide border-b border-default">
            Element {{ idx + 1 }}
          </div>
          <LazyAppObjectView v-if="subItem && typeof subItem === 'object' && !Array.isArray(subItem)" :value="subItem as Record<string, unknown>" />
          <div v-else class="px-3 py-2 text-sm text-default">
            {{ subItem === null || subItem === undefined ? '—' : String(subItem) }}
          </div>
        </div>
      </div>

      <!-- Empty array -->
      <div v-else-if="Array.isArray(item) && item.length === 0" class="py-10 text-center text-sm text-muted">
        pusta lista
      </div>

      <!-- Object key-value view -->
      <div v-else-if="typeof item === 'object' && item !== null" class="max-h-[calc(100svh-16rem)] overflow-auto">
        <LazyAppObjectView :value="item as Record<string, unknown>" />
      </div>

      <!-- Primitive value -->
      <div v-else class="py-4 px-4 text-sm text-default">
        {{ item === null || item === undefined ? '—' : String(item) }}
      </div>

      <!-- Raw JSON expandable -->
      <details v-if="hasContent" class="mt-6 border border-default bg-default rounded-md">
        <summary class="cursor-pointer px-3 py-2 text-sm font-medium text-highlighted hover:bg-elevated/50 rounded-md transition-colors">
          Dane techniczne (JSON)
        </summary>
        <pre class="max-h-[420px] overflow-auto border-t border-default bg-elevated p-3 text-xs leading-relaxed">{{ rawJson }}</pre>
      </details>
    </template>
  </USlideover>
</template>

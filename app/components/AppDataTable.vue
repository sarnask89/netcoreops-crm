<script setup lang="ts" generic="T extends object">
import type { ContextMenuItem, TableColumn } from '@nuxt/ui'

type MenuItems = ContextMenuItem[][]

const props = withDefaults(defineProps<{
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  contextItems?: (row: T) => MenuItems
  emptyLabel?: string
  pageSize?: number
}>(), {
  loading: false,
  emptyLabel: 'Brak danych',
  pageSize: 25
})

const currentRow = ref<T | null>(null)
const page = ref(1)
const total = computed(() => props.data.length)
const pagedData = computed(() => {
  if (props.pageSize <= 0) return props.data
  const start = (page.value - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})

watch(() => [props.data, props.pageSize] as const, () => {
  page.value = 1
})

const items = computed<MenuItems>(() => {
  if (!currentRow.value || !props.contextItems) {
    return [[{
      label: 'Brak akcji dla tego miejsca',
      icon: 'i-lucide-ban',
      disabled: true
    }]]
  }

  return props.contextItems(currentRow.value)
})

function onContextmenu(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    currentRow.value = null
    return
  }

  const row = target.closest('tbody tr')
  const body = row?.parentElement
  if (!row || !body) {
    currentRow.value = null
    return
  }

  const index = Array.from(body.children).indexOf(row)
  currentRow.value = pagedData.value[index] || null
}
</script>

<template>
  <UContextMenu :items="items">
    <div
      class="flex h-full min-h-0 w-full flex-col overflow-hidden border-y border-default bg-default"
      @contextmenu.capture="onContextmenu"
    >
      <UTable
        :data="pagedData"
        :columns="columns"
        :loading="loading"
        sticky
        class="min-h-0 flex-1"
        :ui="{
          root: 'h-full min-h-0 overflow-auto scrollbar-none',
          base: 'min-w-full table-fixed',
          thead: 'bg-elevated/70',
          th: 'h-10 px-3 py-2 text-xs uppercase tracking-wide text-muted',
          td: 'h-11 px-3 py-2 text-sm text-default truncate',
          tbody: '[&>tr]:data-[selectable=true]:hover:bg-elevated/50 divide-y divide-default'
        }"
      >
        <template #empty>
          <div class="py-10 text-center text-sm text-muted">
            {{ emptyLabel }}
          </div>
        </template>
      </UTable>
      <div
        v-if="pageSize > 0 && total > pageSize"
        class="flex items-center justify-between border-t border-default px-3 py-2"
      >
        <div class="text-xs text-muted">
          {{ Math.min((page - 1) * pageSize + 1, total) }}-{{ Math.min(page * pageSize, total) }} z {{ total }}
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="pageSize"
          :total="total"
          size="xs"
        />
      </div>
    </div>
  </UContextMenu>
</template>

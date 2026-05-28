<script setup lang="ts">
const toast = useToast()
const search = ref('')
const auditLog = ref<Array<{ id: string, username: string, action: string, entity: string, entityId: string | null, ip: string | null, userAgent: string | null, createdAt: string }>>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean, data: typeof auditLog.value }>('/api/system/audit-log', {
      query: search.value ? { search: search.value } : {}
    })
    auditLog.value = res.data
  } catch {
    toast.add({ title: 'Błąd ładowania logów', color: 'error' })
  } finally {
    loading.value = false
  }
}

const debouncedLoad = useDebounceFn(load, 200)
watch(search, debouncedLoad)
onMounted(load)

function formatAction(action: string) {
  const map: Record<string, string> = { POST: 'Dodanie', PUT: 'Edycja', PATCH: 'Edycja', DELETE: 'Usunięcie' }
  return map[action] || action
}

function actionColor(action: string) {
  if (action === 'DELETE') return 'error' as const
  if (action === 'POST') return 'success' as const
  return 'warning' as const
}
</script>

<template>
  <UDashboardPanel id="audit-log" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Dziennik audytu">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput v-model="search" placeholder="Szukaj w logach..." class="min-w-60" leading />
        </template>
        <template #right>
          <UButton label="Odśwież" icon="i-lucide-refresh-cw" variant="subtle" @click="load" />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span i-lucide-loader-circle animate-spin class="size-6 text-muted" />
      </div>
      <div v-else-if="!auditLog.length" class="flex flex-col items-center justify-center py-20 text-muted">
        <span i-lucide-search-x class="size-8 mb-2" />
        <p>Brak wpisów audytu</p>
      </div>
      <UTable v-else :data="auditLog" class="w-full">
        <template #columns>
          <UTableColumn header="Data" accessor-key="createdAt" class="w-40">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ new Date(row.createdAt).toLocaleString('pl-PL') }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="Użytkownik" accessor-key="username" class="w-32" />
          <UTableColumn header="Akcja" accessor-key="action" class="w-24">
            <template #default="{ row }">
              <UBadge :color="actionColor(row.action)" variant="subtle" size="sm">{{ formatAction(row.action) }}</UBadge>
            </template>
          </UTableColumn>
          <UTableColumn header="Encja" accessor-key="entity" class="w-48" />
          <UTableColumn header="ID encji" accessor-key="entityId" class="w-32">
            <template #default="{ row }">
              <span class="font-mono text-xs">{{ row.entityId || '-' }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="IP" accessor-key="ip" class="w-32">
            <template #default="{ row }">
              <span class="font-mono text-xs">{{ row.ip || '-' }}</span>
            </template>
          </UTableColumn>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>

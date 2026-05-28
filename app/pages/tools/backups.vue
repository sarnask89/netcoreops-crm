<script setup lang="ts">
interface BackupRow {
  id: string
  equipmentId: string | null
  triggerType: string
  status: string
  backupHash: string | null
  configSize: number | null
  notes: string | null
  createdAt: string
}

const toast = useToast()
const backups = ref<BackupRow[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean, data: BackupRow[] }>('/api/system/backups')
    backups.value = res.data
  } catch {
    toast.add({ title: 'Błąd ładowania kopii zapasowych', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(load)

function triggerTypeLabel(type: string) {
  return type === 'scheduled' ? 'Automatyczna' : 'Ręczna'
}

function statusColor(status: string) {
  return status === 'success' ? 'success' as const : status === 'failed' ? 'error' as const : 'warning' as const
}
</script>

<template>
  <UDashboardPanel id="backups" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Kopie zapasowe konfiguracji">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Odśwież" icon="i-lucide-refresh-cw" variant="subtle" @click="load" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span i-lucide-loader-circle animate-spin class="size-6 text-muted" />
      </div>
      <div v-else-if="!backups.length" class="flex flex-col items-center justify-center py-20 text-muted">
        <span i-lucide-database-backup class="size-8 mb-2" />
        <p>Brak kopii zapasowych</p>
        <p class="text-xs mt-1">Kopie będą widoczne po wykonaniu backupu urządzenia</p>
      </div>
      <UTable v-else :data="backups" class="w-full">
        <template #columns>
          <UTableColumn header="Data" accessor-key="createdAt" class="w-40">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ new Date(row.createdAt).toLocaleString('pl-PL') }}</span>
            </template>
          </UTableColumn>
          <UTableColumn header="Status" accessor-key="status" class="w-24">
            <template #default="{ row }">
              <UBadge :color="statusColor(row.status)" variant="subtle" size="sm">{{ row.status }}</UBadge>
            </template>
          </UTableColumn>
          <UTableColumn header="Typ" accessor-key="triggerType" class="w-24">
            <template #default="{ row }">
              {{ triggerTypeLabel(row.triggerType) }}
            </template>
          </UTableColumn>
          <UTableColumn header="Rozmiar" accessor-key="configSize" class="w-24">
            <template #default="{ row }">
              {{ row.configSize ? `${(row.configSize / 1024).toFixed(1)} KB` : '-' }}
            </template>
          </UTableColumn>
          <UTableColumn header="Hash" accessor-key="backupHash" class="w-32">
            <template #default="{ row }">
              <span class="font-mono text-xs">{{ row.backupHash?.slice(0, 16) || '-' }}</span>
            </template>
          </UTableColumn>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>

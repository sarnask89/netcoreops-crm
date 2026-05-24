<script setup lang="ts">
interface EquipmentOption {
  id: string
  inventoryId: string
  hostname?: string | null
  managementIp?: string | null
  managementProtocol?: string | null
  managementDriver?: { code: string, label?: string } | null
}

interface OptionsResponse {
  success: boolean
  data: { equipment: EquipmentOption[] }
}

const toast = useToast()
const equipmentId = ref<string>()
const oltPort = ref('1')
const onuId = ref('')
const macAddress = ref('')
const loading = ref('')
const result = ref<unknown>(null)

const { data: options } = await useFetch<OptionsResponse>('/api/network/import-options', {
  default: () => ({ success: false, data: { equipment: [] } })
})

const dasanEquipment = computed(() => options.value.data.equipment.filter(item => item.managementDriver?.code === 'dasan_nos'))
const equipmentItems = computed(() => dasanEquipment.value.map(item => ({
  label: [item.inventoryId, item.hostname, item.managementIp].filter(Boolean).join(' - '),
  value: item.id
})))
const selectedEquipment = computed(() => dasanEquipment.value.find(item => item.id === equipmentId.value))

async function runOnuIpHost() {
  if (!equipmentId.value || !oltPort.value || !onuId.value) return
  loading.value = 'onu-ip-host'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/onu-ip-host`, {
      method: 'POST',
      body: { oltPort: oltPort.value, onuId: onuId.value }
    })
  } catch (error) {
    toast.add({ title: 'ONU IP-host nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runMacCheck() {
  if (!equipmentId.value || !macAddress.value) return
  loading.value = 'mac-check'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/mac-check`, {
      method: 'POST',
      body: { macAddress: macAddress.value }
    })
  } catch (error) {
    toast.add({ title: 'MAC lookup nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}

async function runCommandTree() {
  if (!equipmentId.value) return
  loading.value = 'command-tree'
  try {
    result.value = await $fetch(`/api/diagnostics/equipment/${equipmentId.value}/command-tree`, { method: 'POST' })
  } catch (error) {
    toast.add({ title: 'Command tree nie powiódł się', description: error instanceof Error ? error.message : String(error), color: 'error' })
  } finally {
    loading.value = ''
  }
}
</script>

<template>
  <UDashboardPanel id="network-ftth-diagnostics" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="FTTH diagnostyka">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <USelect
              v-model="equipmentId"
              :items="equipmentItems"
              placeholder="Wybierz Dasan OLT"
              class="w-full min-w-0 sm:w-96"
            />
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[360px_1fr]">
        <div class="space-y-4 border-r border-default p-4 sm:p-6">
          <div class="border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              {{ selectedEquipment?.inventoryId || 'Brak OLT' }}
            </div>
            <div class="mt-1 text-sm text-muted">
              {{ selectedEquipment?.managementIp || 'bez IP' }} / {{ selectedEquipment?.managementDriver?.code || 'bez drivera' }}
            </div>
          </div>

          <div class="space-y-3 border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              ONU IP-host / VLAN 400
            </div>
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="oltPort" placeholder="Port OLT" />
              <UInput v-model="onuId" placeholder="ONU ID" />
            </div>
            <UButton
              block
              label="show onu ip-host"
              icon="i-lucide-router"
              :loading="loading === 'onu-ip-host'"
              @click="runOnuIpHost"
            />
          </div>

          <div class="space-y-3 border border-default p-4">
            <div class="text-sm font-semibold text-highlighted">
              MAC lookup
            </div>
            <UInput v-model="macAddress" placeholder="MAC do show mac | include" />
            <UButton
              block
              label="show mac | include"
              icon="i-lucide-search"
              :loading="loading === 'mac-check'"
              @click="runMacCheck"
            />
          </div>

          <UButton
            block
            label="Command tree"
            icon="i-lucide-terminal"
            variant="subtle"
            :loading="loading === 'command-tree'"
            @click="runCommandTree"
          />
        </div>

        <div class="min-w-0 p-4 sm:p-6">
          <AppDiagnosticResult :result="result" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

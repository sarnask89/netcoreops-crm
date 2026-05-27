<script setup lang="ts">
definePageMeta({
  layout: false
})

interface PortalData {
  id: string
  fullName: string
  customerType: string
  contactEmail: string | null
  contactPhone: string | null
  services: Array<{
    id: string
    status: string
    activationDate: string | null
    profileName: string | null
    downloadMbps: number | null
    uploadMbps: number | null
    address: string | null
  }>
  subscriptions: Array<{
    id: string
    status: string
    tariffName: string | null
    price: string | null
    billingPeriod: string
    activationFee: string | null
  }>
  devices: Array<{
    id: string
    hostname: string | null
    equipmentHostname: string | null
    onuHostname: string | null
  }>
}

const { data, status } = await useFetch<{ success: boolean, data: PortalData }>('/api/portal/account/me', {
  default: () => ({ success: false, data: {} as PortalData }),
  onResponseError: () => {
    navigateTo('/portal/login')
  }
})

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

const activeServices = computed(() =>
  data.value.data.services?.filter(s => s.status === 'ACTIVE') || []
)
</script>

<template>
  <main v-if="status === 'success' && data.success" class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 class="font-semibold text-base">
          Portal klienta
        </h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted">{{ data.data.fullName }}</span>
          <UButton
            label="Wyloguj"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-log-out"
            @click="logout"
          />
        </div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <!-- Customer info -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Dane klienta
          </h2>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-muted block">Nazwa</span>
            <span>{{ data.data.fullName }}</span>
          </div>
          <div>
            <span class="text-muted block">Typ</span>
            <span>{{ data.data.customerType === 'individual' ? 'Osoba fizyczna' : 'Firma' }}</span>
          </div>
          <div v-if="data.data.contactEmail">
            <span class="text-muted block">E-mail</span>
            <span>{{ data.data.contactEmail }}</span>
          </div>
          <div v-if="data.data.contactPhone">
            <span class="text-muted block">Telefon</span>
            <span>{{ data.data.contactPhone }}</span>
          </div>
        </div>
      </UCard>

      <!-- Active services -->
      <UCard v-if="activeServices.length > 0">
        <template #header>
          <h2 class="font-semibold">
            Usługi
          </h2>
        </template>
        <div class="space-y-3">
          <div
            v-for="service in activeServices"
            :key="service.id"
            class="border border-gray-800 rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">{{ service.profileName || 'Usługa' }}</span>
              <UBadge :color="service.status === 'ACTIVE' ? 'success' : 'neutral'" variant="subtle">
                {{ service.status === 'ACTIVE' ? 'Aktywna' : service.status }}
              </UBadge>
            </div>
            <div v-if="service.downloadMbps || service.uploadMbps" class="text-sm text-muted">
              {{ service.downloadMbps }}/{{ service.uploadMbps }} Mbps
            </div>
            <div v-if="service.address" class="text-sm text-muted">
              {{ service.address }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Subscriptions -->
      <UCard v-if="data.data.subscriptions?.length">
        <template #header>
          <h2 class="font-semibold">
            Abonamenty
          </h2>
        </template>
        <div class="space-y-3">
          <div
            v-for="sub in data.data.subscriptions"
            :key="sub.id"
            class="border border-gray-800 rounded-lg p-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">{{ sub.tariffName || 'Abonament' }}</span>
                <span class="text-sm text-muted ml-2">
                  {{ sub.billingPeriod === 'monthly' ? 'miesięczny' : sub.billingPeriod === 'quarterly' ? 'kwartalny' : 'roczny' }}
                </span>
              </div>
              <div class="text-right">
                <div class="font-medium">
                  {{ sub.price ? `${sub.price} zł` : '-' }}
                </div>
                <UBadge
                  v-if="sub.status !== 'ACTIVE'"
                  size="sm"
                  color="warning"
                  variant="subtle"
                >
                  {{ sub.status }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </main>

  <!-- Loading state -->
  <main v-else class="min-h-screen bg-gray-950 flex items-center justify-center">
    <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
  </main>
</template>

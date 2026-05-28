<script setup lang="ts">
definePageMeta({ layout: false })

interface OfferRow {
  id: string
  name: string
  serviceType: string
  defaultNetPrice: number
  vatRate: number
  downloadMbps: number | null
  uploadMbps: number | null
  description: string | null
  isSubscribed: boolean
}

const { data, status } = await useFetch<{ success: boolean, data: OfferRow[] }>('/api/portal/offers', {
  default: () => ({ success: false, data: [] }),
  onResponseError: () => navigateTo('/portal/login')
})

const toast = useToast()

function grossPrice(net: number, vatRate: number): string {
  return `${(net * (1 + vatRate / 100)).toFixed(2)} zł`
}

function netPrice(value: number): string {
  return `${value.toFixed(2)} zł`
}

const serviceTypeLabels: Record<string, string> = {
  internet: 'Internet',
  voip: 'VoIP',
  iptv: 'Telewizja',
  hosting: 'Hosting',
  other: 'Inne'
}

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

function switchOffer() {
  toast.add({ title: 'Funkcja zmiany oferty będzie dostępna wkrótce', color: 'info' })
}
</script>

<template>
  <main class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UButton
            to="/portal"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-left"
          />
          <h1 class="font-semibold text-base">
            Oferty
          </h1>
        </div>
        <UButton
          label="Wyloguj"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-log-out"
          @click="logout"
        />
      </div>
    </header>

    <div v-if="status === 'success'" class="max-w-5xl mx-auto px-4 py-6">
      <div v-if="data.data.length === 0" class="text-center py-12 text-muted">
        Brak dostępnych ofert
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UCard v-for="offer in data.data" :key="offer.id">
          <div class="space-y-3">
            <div>
              <h3 class="font-semibold">
                {{ offer.name }}
              </h3>
              <span class="text-xs text-muted">{{ serviceTypeLabels[offer.serviceType] || offer.serviceType }}</span>
            </div>

            <p v-if="offer.description" class="text-sm text-muted">
              {{ offer.description }}
            </p>

            <div v-if="offer.downloadMbps || offer.uploadMbps" class="text-sm">
              <span class="font-medium">{{ offer.downloadMbps }}/{{ offer.uploadMbps }} Mbps</span>
            </div>

            <div class="flex items-baseline gap-1">
              <span class="text-lg font-semibold">{{ grossPrice(offer.defaultNetPrice, offer.vatRate) }}</span>
              <span class="text-xs text-muted">brutto / mies.</span>
            </div>
            <div class="text-xs text-muted">
              {{ netPrice(offer.defaultNetPrice) }} netto + {{ offer.vatRate }}% VAT
            </div>

            <div v-if="offer.isSubscribed">
              <UBadge color="success" variant="subtle">
                Już posiadasz
              </UBadge>
            </div>
            <UButton
              v-else
              label="Zmień na tę ofertę"
              color="primary"
              size="sm"
              class="w-full"
              @click="switchOffer"
            />
          </div>
        </UCard>
      </div>
    </div>

    <main v-else class="min-h-screen bg-gray-950 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
    </main>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

interface PaymentRow {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  reference: string
  documentId: string | null
}

const { data, status } = await useFetch<{ success: boolean, data: PaymentRow[] }>('/api/portal/payments', {
  default: () => ({ success: false, data: [] }),
  onResponseError: () => navigateTo('/portal/login')
})

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Przelew',
  cash: 'Gotówka',
  card: 'Karta płatnicza',
  direct_debit: 'Polecenie zapłaty',
  pay_by_link: 'Pay-by-link'
}

function formatCurrency(value: number): string {
  return `${value.toFixed(2)} zł`
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
            Historia wpłat
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

    <div v-if="status === 'success'" class="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <p class="text-sm text-muted">
        {{ data.data.length }} wpłat
      </p>

      <div v-if="data.data.length === 0" class="text-center py-12 text-muted">
        Brak wpłat
      </div>

      <div v-for="payment in data.data" :key="payment.id">
        <UCard>
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium tabular-nums">{{ formatCurrency(payment.amount) }}</span>
                <span class="text-xs text-muted">{{ new Date(payment.paymentDate).toLocaleDateString('pl-PL') }}</span>
              </div>
              <p class="text-xs text-muted mt-1">
                {{ paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod }}
                <span v-if="payment.reference">&middot; {{ payment.reference }}</span>
              </p>
            </div>
            <div v-if="payment.documentId" class="ml-4 flex-shrink-0">
              <NuxtLink :to="`/portal/invoices/${payment.documentId}`" class="text-sm text-primary hover:underline">
                Faktura
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <main v-else class="min-h-screen bg-gray-950 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
    </main>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

interface InvoiceRow {
  id: string
  fullNumber: string
  issueDate: string
  dueDate: string
  totalGross: number
  paymentStatus: string
  isCancelled: boolean
}

const { data, status } = await useFetch<{ success: boolean, data: InvoiceRow[] }>('/api/portal/invoices', {
  default: () => ({ success: false, data: [] }),
  onResponseError: () => navigateTo('/portal/login')
})

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

const statusConfig: Record<string, { label: string, color: 'warning' | 'success' | 'error' | 'neutral' }> = {
  unpaid: { label: 'Nieopłacona', color: 'warning' },
  paid: { label: 'Opłacona', color: 'success' },
  overdue: { label: 'Zaległa', color: 'error' },
  cancelled: { label: 'Anulowana', color: 'neutral' }
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
            Faktury
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
      <div v-if="data.data.length === 0" class="text-center py-12 text-muted">
        Brak faktur
      </div>

      <div v-for="invoice in data.data" :key="invoice.id">
        <NuxtLink :to="`/portal/invoices/${invoice.id}`" class="block">
          <UCard class="hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h3 :class="['font-medium truncate', invoice.isCancelled ? 'line-through text-muted' : '']">
                  {{ invoice.fullNumber }}
                </h3>
                <p class="text-xs text-muted mt-1">
                  {{ new Date(invoice.issueDate).toLocaleDateString('pl-PL') }} &middot; termin: {{ new Date(invoice.dueDate).toLocaleDateString('pl-PL') }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-4 flex-shrink-0">
                <span class="font-medium tabular-nums">{{ formatCurrency(invoice.totalGross) }}</span>
                <UBadge
                  v-if="!invoice.isCancelled"
                  :color="statusConfig[invoice.paymentStatus]?.color || 'neutral'"
                  variant="subtle"
                >
                  {{ statusConfig[invoice.paymentStatus]?.label || invoice.paymentStatus }}
                </UBadge>
                <UBadge v-else color="neutral" variant="subtle">
                  Anulowana
                </UBadge>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <main v-else class="min-h-screen bg-gray-950 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
    </main>
  </main>
</template>

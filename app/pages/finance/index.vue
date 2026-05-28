<script setup lang="ts">
interface DocSummary {
  id: string
  type: string
  fullNumber: string
  totalGross: string
  paymentStatus: string
  isCancelled: boolean
  customer?: { fullName: string } | null
}

interface PaymentSummary {
  id: string
  amount: string
  paymentDate: string
  customer?: { fullName: string } | null
}

const { data: docsData } = await useFetch<{ success: boolean, data: DocSummary[] }>('/api/finance/documents', {
  default: () => ({ success: false, data: [] })
})
const { data: paymentsData } = await useFetch<{ success: boolean, data: PaymentSummary[] }>('/api/finance/payments', {
  default: () => ({ success: false, data: [] })
})

const stats = computed(() => {
  const docs = docsData.value.data || []
  const pays = paymentsData.value.data || []

  const unpaidCount = docs.filter(d => d.paymentStatus === 'unpaid' && !d.isCancelled).length
  const overdueDocs = docs.filter(d => d.paymentStatus === 'unpaid' && !d.isCancelled)
  const unpaidTotal = overdueDocs.reduce((s, d) => s + Number(d.totalGross), 0)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const paidThisMonth = pays
    .filter(p => p.paymentDate.startsWith(thisMonth))
    .reduce((s, p) => s + Number(p.amount), 0)

  return {
    unpaidCount,
    unpaidTotal,
    paidThisMonth,
    totalDocs: docs.length
  }
})
</script>

<template>
  <UDashboardPanel id="finance-index" :ui="{ body: 'p-6 sm:p-6 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Finanse">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton to="/finance/documents" color="primary" label="Faktury" />
          <UButton
            to="/finance/payments"
            color="primary"
            label="Płatności"
            variant="outline"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-file-text" class="text-primary" />
            <span>Niezapłacone faktury</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.unpaidCount }}
        </p>
        <p class="text-sm text-muted-foreground">
          Kwota: {{ stats.unpaidTotal.toFixed(2) }} PLN
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-credit-card" class="text-green-500" />
            <span>Płatności w tym miesiącu</span>
          </div>
        </template>
        <p class="text-3xl font-bold text-green-600">
          {{ stats.paidThisMonth.toFixed(2) }}
        </p>
        <p class="text-sm text-muted-foreground">
          PLN
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-receipt" class="text-muted-foreground" />
            <span>Wszystkie dokumenty</span>
          </div>
        </template>
        <p class="text-3xl font-bold">
          {{ stats.totalDocs }}
        </p>
        <p class="text-sm text-muted-foreground">
          Łącznie wystawionych
        </p>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2 text-lg font-semibold">
          <UIcon name="i-lucide-zap" class="text-primary" />
          <span>Szybkie akcje</span>
        </div>
      </template>
      <div class="flex flex-wrap gap-3">
        <UButton
          to="/finance/documents"
          color="primary"
          icon="i-lucide-plus"
          label="Nowa faktura"
        />
        <UButton
          to="/finance/payments"
          color="primary"
          icon="i-lucide-plus"
          label="Nowa płatność"
          variant="outline"
        />
        <UButton
          to="/finance/number-plans"
          color="primary"
          icon="i-lucide-list"
          label="Plany numeracji"
          variant="soft"
        />
      </div>
    </UCard>
  </UDashboardPanel>
</template>

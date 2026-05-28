<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

interface InvoiceItem {
  ordinal: number
  description: string
  quantity: number
  unitNetPrice: number
  netAmount: number
  vatAmount: number
  grossAmount: number
}

interface InvoicePayment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  reference: string
}

interface InvoiceDetail {
  id: string
  fullNumber: string
  issueDate: string
  saleDate: string
  dueDate: string
  paymentMethod: string
  paymentStatus: string
  totalNet: number
  totalVat: number
  totalGross: number
  customerName: string
  customerAddress: string | null
  customerTaxId: string | null
  issuerName: string
  issuerBankName: string | null
  issuerBankAccount: string | null
  notes: string | null
  isCancelled: boolean
  items: InvoiceItem[]
  payments: InvoicePayment[]
}

const { data, status } = await useFetch<{ success: boolean, data: InvoiceDetail }>(
  `/api/portal/invoices/${route.params.id}`,
  { default: () => ({ success: false, data: {} as InvoiceDetail }) }
)

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}

const paymentMethodLabels: Record<string, string> = {
  transfer: 'Przelew',
  cash: 'Gotówka',
  card: 'Karta',
  pay_by_link: 'Pay by link',
  direct_debit: 'Polecenie zapłaty',
  compensation: 'Kompensta',
  other: 'Inny'
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL')
}

const showPayInfo = ref(false)
</script>

<template>
  <main class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UButton
            to="/portal/invoices"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-left"
          />
          <h1 class="font-semibold text-base truncate max-w-md">
            {{ data.data?.fullNumber || 'Faktura' }}
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

    <div v-if="status === 'success'" class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <!-- Invoice header -->
      <UCard>
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 class="font-semibold text-lg">
              {{ data.data.fullNumber }}
            </h2>
            <div class="flex items-center gap-2 mt-2 flex-wrap text-sm text-muted">
              <span>Wystawiono: {{ formatDate(data.data.issueDate) }}</span>
              <span>&middot;</span>
              <span>Data sprzedaży: {{ formatDate(data.data.saleDate) }}</span>
              <span>&middot;</span>
              <span>Termin płatności: {{ formatDate(data.data.dueDate) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="data.data.paymentMethod" class="text-xs text-muted">
              {{ paymentMethodLabels[data.data.paymentMethod] || data.data.paymentMethod }}
            </span>
            <UBadge
              :color="data.data.isCancelled ? 'neutral' : statusConfig[data.data.paymentStatus]?.color || 'neutral'"
              variant="subtle"
            >
              {{ data.data.isCancelled ? 'Anulowana' : statusConfig[data.data.paymentStatus]?.label || data.data.paymentStatus }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Issuer & Customer -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-sm">
              Sprzedawca
            </h2>
          </template>
          <div class="text-sm space-y-1">
            <p>{{ data.data.issuerName }}</p>
            <p class="text-muted">
              {{ data.data.issuerBankName }}
            </p>
            <p v-if="data.data.issuerBankAccount" class="text-muted font-mono text-xs">
              {{ data.data.issuerBankAccount }}
            </p>
          </div>
        </UCard>
        <UCard>
          <template #header>
            <h2 class="font-semibold text-sm">
              Nabywca
            </h2>
          </template>
          <div class="text-sm space-y-1">
            <p>{{ data.data.customerName }}</p>
            <p v-if="data.data.customerAddress" class="text-muted">
              {{ data.data.customerAddress }}
            </p>
            <p v-if="data.data.customerTaxId" class="text-muted">
              NIP: {{ data.data.customerTaxId }}
            </p>
          </div>
        </UCard>
      </div>

      <!-- Items table -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Pozycje faktury
          </h2>
        </template>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800 text-muted">
              <th class="text-left py-2 pr-2 w-10">
                Lp.
              </th>
              <th class="text-left py-2 px-2">
                Nazwa
              </th>
              <th class="text-right py-2 px-2 w-16">
                Ilość
              </th>
              <th class="text-right py-2 px-2 w-24">
                Cena jedn. netto
              </th>
              <th class="text-right py-2 px-2 w-24">
                Netto
              </th>
              <th class="text-right py-2 px-2 w-20">
                VAT
              </th>
              <th class="text-right py-2 pl-2 w-24">
                Brutto
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.data.items" :key="item.ordinal" class="border-b border-gray-800/50">
              <td class="py-2 pr-2 text-muted">
                {{ item.ordinal }}
              </td>
              <td class="py-2 px-2">
                {{ item.description }}
              </td>
              <td class="py-2 px-2 text-right tabular-nums">
                {{ item.quantity }}
              </td>
              <td class="py-2 px-2 text-right tabular-nums">
                {{ formatCurrency(item.unitNetPrice) }}
              </td>
              <td class="py-2 px-2 text-right tabular-nums">
                {{ formatCurrency(item.netAmount) }}
              </td>
              <td class="py-2 px-2 text-right tabular-nums">
                {{ formatCurrency(item.vatAmount) }}
              </td>
              <td class="py-2 pl-2 text-right tabular-nums font-medium">
                {{ formatCurrency(item.grossAmount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>

      <!-- Totals -->
      <UCard>
        <div class="space-y-1 text-sm text-right">
          <div class="flex justify-end gap-8">
            <span class="text-muted">Razem netto:</span>
            <span class="tabular-nums w-28 text-right">{{ formatCurrency(data.data.totalNet) }}</span>
          </div>
          <div class="flex justify-end gap-8">
            <span class="text-muted">W tym VAT:</span>
            <span class="tabular-nums w-28 text-right">{{ formatCurrency(data.data.totalVat) }}</span>
          </div>
          <div class="flex justify-end gap-8 text-base font-semibold pt-1 border-t border-gray-800">
            <span>Razem brutto:</span>
            <span class="tabular-nums w-28 text-right">{{ formatCurrency(data.data.totalGross) }}</span>
          </div>
        </div>
      </UCard>

      <!-- Payments -->
      <UCard v-if="data.data.payments.length > 0">
        <template #header>
          <h2 class="font-semibold">
            Wpłaty
          </h2>
        </template>
        <div class="space-y-2">
          <div v-for="payment in data.data.payments" :key="payment.id" class="flex items-center justify-between text-sm border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
            <div>
              <span class="font-medium tabular-nums">{{ formatCurrency(payment.amount) }}</span>
              <span class="text-muted ml-2">{{ formatDate(payment.paymentDate) }}</span>
            </div>
            <span class="text-muted text-xs">{{ paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod }}</span>
          </div>
        </div>
      </UCard>

      <!-- Notes -->
      <UCard v-if="data.data.notes">
        <template #header>
          <h2 class="font-semibold">
            Uwagi
          </h2>
        </template>
        <p class="text-sm whitespace-pre-wrap">
          {{ data.data.notes }}
        </p>
      </UCard>

      <!-- Pay section -->
      <div v-if="(data.data.paymentStatus === 'unpaid' || data.data.paymentStatus === 'overdue') && !data.data.isCancelled">
        <UButton
          v-if="!showPayInfo"
          label="Zapłać przelewem"
          color="primary"
          icon="i-lucide-credit-card"
          @click="showPayInfo = true"
        />
        <UCard v-else>
          <template #header>
            <h2 class="font-semibold">
              Dane do przelewu
            </h2>
          </template>
          <div class="text-sm space-y-3">
            <div v-if="data.data.issuerBankName">
              <span class="text-muted block">Odbiorca:</span>
              <span>{{ data.data.issuerName }}</span>
            </div>
            <div v-if="data.data.issuerBankName">
              <span class="text-muted block">Bank:</span>
              <span>{{ data.data.issuerBankName }}</span>
            </div>
            <div v-if="data.data.issuerBankAccount">
              <span class="text-muted block">Numer rachunku:</span>
              <span class="font-mono">{{ data.data.issuerBankAccount }}</span>
            </div>
            <div>
              <span class="text-muted block">Tytuł przelewu:</span>
              <span class="font-mono">{{ data.data.fullNumber }}</span>
            </div>
            <div>
              <span class="text-muted block">Kwota:</span>
              <span class="font-semibold text-base">{{ formatCurrency(data.data.totalGross) }}</span>
            </div>
            <div>
              <span class="text-muted block">Termin płatności:</span>
              <span>{{ formatDate(data.data.dueDate) }}</span>
            </div>
            <UButton
              label="Ukryj dane"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="showPayInfo = false"
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

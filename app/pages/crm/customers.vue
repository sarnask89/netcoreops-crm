<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'
import { customerFormSchema, type CustomerFormSchema } from '#shared/schemas/customers'

const router = useRouter()

interface PortalAccessData {
  login: string
  password: string
  message: string
}

interface CustomerRow {
  id: string
  fullName: string
  customerType: 'INDIVIDUAL' | 'BUSINESS'
  firstName?: string | null
  lastName?: string | null
  pesel?: string | null
  identityDocumentNumber?: string | null
  companyName?: string | null
  taxId?: string | null
  regon?: string | null
  krs?: string | null
  representativeName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  billingAddress?: string | null
  billingTerytArea?: { terytCode: string } | null
  billingSimcLocality?: { simcCode: string, name?: string | null } | null
  billingStreet?: { ulicCode?: string | null, streetType?: string | null, name: string } | null
  billingBuildingNumber?: string | null
  billingApartmentNumber?: string | null
  importIssues?: string[]
  portalUser?: { id: string, login: string, isActive: boolean, lastLoginAt: string | null } | null
  services: Array<{
    id?: string
    status: string
    importIssues?: string[]
    profile: { name: string }
    serviceStreet?: { streetType?: string | null, name: string } | null
    serviceSimcLocality?: { name: string } | null
    serviceBuildingNumber?: string | null
    serviceApartmentNumber?: string | null
    equipment?: { inventoryId: string, hostname?: string | null, node?: { name: string } | null } | null
  }>
}

interface OptionsResponse {
  success: boolean
  data: {
    profiles: Array<{ id: number, name: string }>
    equipment: Array<{ id: string, inventoryId: string, hostname?: string | null, managementIp?: string | null }>
  }
}

const toast = useToast()
const customerOpen = ref(false)
const serviceOpen = ref(false)
const detailsOpen = ref(false)
const archiveOpen = ref(false)
const selectedRow = ref<CustomerRow | null>(null)
const editingCustomerId = ref<string | null>(null)
const archiveReason = ref('')
const portalAccessOpen = ref(false)
const portalAccessLoading = ref(false)
const portalAccessData = ref<PortalAccessData | null>(null)
const query = ref('')
const issueFilter = ref<'all' | 'issues'>('all')
const billingAddressInput = ref('')
const addressInput = ref('')
const selectedBillingAddress = ref<{ terytCode: string, simcCode: string, ulicCode?: string | null } | null>(null)
const selectedAddress = ref<{ terytCode: string, simcCode: string, ulicCode: string } | null>(null)
const cityInput = ref('')
const selectedCity = ref<{ source: string, name: string } | null>(null)

const customerSchema = customerFormSchema

const serviceSchema = z.object({
  customerId: z.string().uuid(),
  profileId: z.number().int().positive(),
  equipmentId: z.string().uuid().optional().nullable(),
  buildingNumber: z.string().min(1),
  apartmentNumber: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE'])
})

type ServiceSchema = z.output<typeof serviceSchema>

const customerState = reactive<Partial<CustomerFormSchema>>({
  customerType: 'BUSINESS'
})
const serviceState = reactive<Partial<ServiceSchema>>({
  status: 'ACTIVE'
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: CustomerRow[] }>('/api/crm/customers', {
  default: () => ({ success: false, data: [] })
})
const { data: options } = await useFetch<OptionsResponse>('/api/system/options', {
  default: () => ({ success: false, data: { profiles: [], equipment: [] } })
})

const customerItems = computed(() => data.value.data.map(customer => ({
  label: customer.fullName,
  value: customer.id
})))
const profileItems = computed(() => options.value.data.profiles.map(profile => ({
  label: profile.name,
  value: profile.id
})))
const equipmentItems = computed(() => [
  { label: 'Bez urządzenia', value: null },
  ...options.value.data.equipment.map(equipment => ({
    label: [equipment.inventoryId, equipment.hostname || equipment.managementIp].filter(Boolean).join(' - '),
    value: equipment.id
  }))
])

const rows = computed(() => data.value.data.filter((row) => {
  const text = [row.fullName, row.contactEmail, row.contactPhone, row.billingAddress, row.services[0]?.profile.name].filter(Boolean).join(' ').toLowerCase()
  const matchesQuery = !query.value || text.includes(query.value.toLowerCase())
  const hasIssues = Boolean(row.importIssues?.length || row.services.some(service => service.importIssues?.length))
  const matchesIssues = issueFilter.value === 'all' || hasIssues
  return matchesQuery && matchesIssues
}))
const columns: TableColumn<CustomerRow>[] = [
  {
    accessorKey: 'fullName',
    header: 'Klient'
  },
  {
    id: 'customerType',
    header: 'Typ',
    cell: ({ row }) => row.original.customerType === 'BUSINESS' ? 'Firma' : 'Indywidualny'
  },
  {
    id: 'identity',
    header: 'Dane',
    cell: ({ row }) => {
      const customer = row.original
      return customer.customerType === 'BUSINESS'
        ? [customer.taxId && `NIP ${customer.taxId}`, customer.regon && `REGON ${customer.regon}`].filter(Boolean).join(', ') || 'Brak'
        : [customer.pesel && `PESEL ${customer.pesel}`, customer.identityDocumentNumber].filter(Boolean).join(', ') || 'Brak'
    }
  },
  { accessorKey: 'contactEmail', header: 'Email' },
  { accessorKey: 'contactPhone', header: 'Telefon' },
  {
    id: 'billingAddress',
    header: 'Adres klienta',
    cell: ({ row }) => formatAddress(row.original) || row.original.billingAddress || 'Brak'
  },
  {
    id: 'service',
    header: 'Usługa',
    cell: ({ row }) => row.original.services[0]?.profile.name || 'Brak'
  },
  {
    id: 'address',
    header: 'Adres usługi',
    cell: ({ row }) => row.original.services[0] ? formatAddress(row.original.services[0]) : 'Brak'
  },
  {
    id: 'equipment',
    header: 'Urządzenie',
    cell: ({ row }) => row.original.services[0]?.equipment?.hostname || row.original.services[0]?.equipment?.inventoryId || 'Brak'
  },
  {
    id: 'importIssues',
    header: 'Braki',
    cell: ({ row }) => row.original.importIssues?.length ? row.original.importIssues.join(', ') : 'Brak'
  },
  {
    id: 'portalAccess',
    header: 'Portal',
    cell: ({ row }) => {
      const pu = row.original.portalUser
      if (!pu) return 'Brak'
      if (!pu.isActive) return 'Nieaktywny'
      return pu.lastLoginAt ? 'Aktywny' : 'Wygenerowany'
    }
  }
]

function resetCustomerForm() {
  editingCustomerId.value = null
  Object.assign(customerState, {
    customerType: 'BUSINESS',
    firstName: undefined,
    lastName: undefined,
    pesel: undefined,
    identityDocumentNumber: undefined,
    companyName: undefined,
    taxId: undefined,
    regon: undefined,
    krs: undefined,
    representativeName: undefined,
    contactEmail: undefined,
    contactPhone: undefined,
    billingBuildingNumber: undefined,
    billingApartmentNumber: undefined,
    billingAddress: undefined
  })
  billingAddressInput.value = ''
  selectedBillingAddress.value = null
  cityInput.value = ''
  selectedCity.value = null
}

function openCreateCustomer() {
  resetCustomerForm()
  customerOpen.value = true
}

function handleCityInput(value: string | number) {
  const city = String(value || '')
  selectedCity.value = null
  customerState.billingAddress = city || undefined
}

function openEditCustomer(row: CustomerRow) {
  selectedRow.value = row
  editingCustomerId.value = row.id
  Object.assign(customerState, {
    customerType: row.customerType,
    firstName: row.firstName || undefined,
    lastName: row.lastName || undefined,
    pesel: row.pesel || undefined,
    identityDocumentNumber: row.identityDocumentNumber || undefined,
    companyName: row.companyName || undefined,
    taxId: row.taxId || undefined,
    regon: row.regon || undefined,
    krs: row.krs || undefined,
    representativeName: row.representativeName || undefined,
    contactEmail: row.contactEmail || undefined,
    contactPhone: row.contactPhone || undefined,
    billingBuildingNumber: row.billingBuildingNumber || undefined,
    billingApartmentNumber: row.billingApartmentNumber || undefined,
    billingAddress: row.billingAddress || undefined
  })
  billingAddressInput.value = formatAddress(row) || row.billingAddress || ''
  cityInput.value = row.billingSimcLocality?.name || row.billingAddress || ''
  selectedCity.value = null
  selectedBillingAddress.value = row.billingTerytArea && row.billingSimcLocality
    ? {
        terytCode: row.billingTerytArea.terytCode,
        simcCode: row.billingSimcLocality.simcCode,
        ulicCode: row.billingStreet?.ulicCode || undefined
      }
    : null
  customerOpen.value = true
}

async function saveCustomer(event: FormSubmitEvent<CustomerFormSchema>) {
  if (billingAddressInput.value && !selectedBillingAddress.value) {
    if (!editingCustomerId.value) {
      toast.add({ title: 'Wybierz adres klienta z autosugestii', color: 'warning' })
      return
    }
  }

  const body = {
    ...event.data,
    billingAddressRef: selectedBillingAddress.value
      ? {
          ...selectedBillingAddress.value,
          buildingNumber: event.data.billingBuildingNumber,
          apartmentNumber: event.data.billingApartmentNumber
        }
      : undefined
  }

  if (editingCustomerId.value) {
    await $fetch(`/api/crm/customers/${editingCustomerId.value}`, {
      method: 'PATCH',
      body
    })
    toast.add({ title: 'Klient zaktualizowany', color: 'success' })
  } else {
    await $fetch('/api/crm/customers', {
      method: 'POST',
      body: {
        ...body,
        billingAddressRef: body.billingAddressRef || null
      }
    })
    toast.add({ title: 'Klient zapisany', color: 'success' })
  }

  customerOpen.value = false
  resetCustomerForm()
  await refresh()
}

function openArchiveCustomer(row: CustomerRow) {
  selectedRow.value = row
  archiveReason.value = ''
  archiveOpen.value = true
}

async function archiveCustomer() {
  if (!selectedRow.value) return
  await $fetch(`/api/crm/customers/${selectedRow.value.id}`, {
    method: 'DELETE',
    body: { archiveReason: archiveReason.value || null }
  })
  toast.add({ title: 'Klient zarchiwizowany', color: 'success' })
  archiveOpen.value = false
  await refresh()
}

async function createService(event: FormSubmitEvent<ServiceSchema>) {
  if (!selectedAddress.value) {
    toast.add({ title: 'Wybierz adres z autosugestii', color: 'warning' })
    return
  }

  await $fetch('/api/crm/services', {
    method: 'POST',
    body: {
      ...event.data,
      equipmentId: event.data.equipmentId || null,
      address: {
        ...selectedAddress.value,
        buildingNumber: event.data.buildingNumber,
        apartmentNumber: event.data.apartmentNumber
      }
    }
  })
  toast.add({ title: 'Usługa zapisana', color: 'success' })
  serviceOpen.value = false
  await refresh()
}

function showDetails(row: CustomerRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.add({ title: 'Skopiowano do schowka', color: 'success' })
}

async function generatePortalAccess(row: CustomerRow) {
  portalAccessLoading.value = true
  portalAccessData.value = null
  portalAccessOpen.value = true
  try {
    const res = await $fetch<{ success: boolean, data: PortalAccessData }>(
      `/api/crm/customers/${row.id}/portal-access`,
      { method: 'POST' }
    )
    portalAccessData.value = res.data
  } catch {
    portalAccessOpen.value = false
    toast.add({ title: 'Nie udało się wygenerować dostępu do portalu', color: 'error' })
  } finally {
    portalAccessLoading.value = false
    await refresh()
  }
}

function rowContextItems(row: CustomerRow): ContextMenuItem[][] {
  const items: ContextMenuItem[][] = [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEditCustomer(row) },
    { label: 'Szczegóły klienta', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    {
      label: 'Dodaj usługę dla klienta',
      icon: 'i-lucide-plus',
      onSelect: () => {
        serviceState.customerId = row.id
        serviceOpen.value = true
      }
    }
  ], [
    {
      label: row.portalUser
        ? 'Resetuj dostęp do portalu'
        : 'Generuj dostęp do portalu',
      icon: 'i-lucide-globe',
      onSelect: () => generatePortalAccess(row)
    }
  ]]

  items.push([
    {
      label: 'Generuj fakturę',
      icon: 'i-lucide-file-plus',
      onSelect: () => router.push(`/finance/documents?customerId=${row.id}`)
    },
    {
      label: 'Płatności',
      icon: 'i-lucide-banknote',
      onSelect: () => router.push(`/finance/payments?customerId=${row.id}`)
    },
    {
      label: 'Saldo klienta',
      icon: 'i-lucide-wallet',
      onSelect: () => router.push(`/finance?customerId=${row.id}`)
    }
  ])

  items.push([
    {
      label: 'Zgłoszenia',
      icon: 'i-lucide-life-buoy',
      onSelect: () => router.push(`/helpdesk/tickets?customerId=${row.id}`)
    },
    {
      label: 'Nowe zgłoszenie',
      icon: 'i-lucide-ticket-plus',
      onSelect: () => router.push(`/helpdesk/tickets?newCustomerId=${row.id}`)
    }
  ])

  items.push([
    { label: 'Archiwizuj', icon: 'i-lucide-archive', color: 'error', onSelect: () => openArchiveCustomer(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ])

  return items
}
</script>

<template>
  <UDashboardPanel id="crm-customers" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Klienci i usługi">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="query"
            icon="i-lucide-search"
            placeholder="Szukaj"
            class="w-56"
          />
          <USelect
            v-model="issueFilter"
            :items="[
              { label: 'Wszystkie', value: 'all' },
              { label: 'Tylko z brakami', value: 'issues' }
            ]"
            class="w-44"
          />
          <USlideover v-model:open="customerOpen" :title="editingCustomerId ? 'Edytuj klienta' : 'Dodaj klienta'">
            <UButton
              label="Dodaj klienta"
              icon="i-lucide-user-plus"
              variant="subtle"
              @click="openCreateCustomer"
            />
            <template #body>
              <UForm
                :schema="customerSchema"
                :state="customerState"
                class="space-y-4"
                @submit="saveCustomer"
              >
                <UFormField label="Typ klienta" name="customerType">
                  <USelect
                    v-model="customerState.customerType"
                    :items="[
                      { label: 'Klient indywidualny', value: 'INDIVIDUAL' },
                      { label: 'Firma', value: 'BUSINESS' }
                    ]"
                    class="w-full"
                  />
                </UFormField>

                <template v-if="customerState.customerType === 'INDIVIDUAL'">
                  <div class="grid gap-4 md:grid-cols-2">
                    <UFormField label="Imię" name="firstName" required>
                      <UInput v-model="customerState.firstName" class="w-full" />
                    </UFormField>
                    <UFormField label="Nazwisko" name="lastName" required>
                      <UInput v-model="customerState.lastName" class="w-full" />
                    </UFormField>
                    <UFormField label="PESEL" name="pesel">
                      <UInput v-model="customerState.pesel" class="w-full" />
                    </UFormField>
                    <UFormField label="Dokument tożsamości" name="identityDocumentNumber">
                      <UInput v-model="customerState.identityDocumentNumber" class="w-full" />
                    </UFormField>
                  </div>
                </template>

                <template v-else>
                  <UFormField label="Nazwa firmy" name="companyName" required>
                    <UInput v-model="customerState.companyName" class="w-full" />
                  </UFormField>
                  <div class="grid gap-4 md:grid-cols-2">
                    <UFormField label="NIP" name="taxId">
                      <UInput v-model="customerState.taxId" class="w-full" />
                    </UFormField>
                    <UFormField label="REGON" name="regon">
                      <UInput v-model="customerState.regon" class="w-full" />
                    </UFormField>
                    <UFormField label="KRS / EDG" name="krs">
                      <UInput v-model="customerState.krs" class="w-full" />
                    </UFormField>
                    <UFormField label="Osoba reprezentująca" name="representativeName">
                      <UInput v-model="customerState.representativeName" class="w-full" />
                    </UFormField>
                  </div>
                </template>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Email" name="contactEmail">
                    <UInput v-model="customerState.contactEmail" class="w-full" />
                  </UFormField>
                  <UFormField label="Telefon" name="contactPhone">
                    <UInput v-model="customerState.contactPhone" class="w-full" />
                  </UFormField>
                </div>
                <UFormField
                  label="Miasto (opis adresu)"
                  help="Pole opisowe. Strukturalny adres wybierz poniżej z definicji."
                >
                  <CityAutocomplete
                    v-model="cityInput"
                    @update:model-value="handleCityInput"
                    @select="selectedCity = $event; customerState.billingAddress = $event.name"
                  />
                </UFormField>
                <UFormField label="Adres klienta z definicji">
                  <AddressAutocomplete
                    v-model="billingAddressInput"
                    @update:model-value="selectedBillingAddress = null"
                    @select="selectedBillingAddress = $event"
                  />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Nr budynku" name="billingBuildingNumber">
                    <UInput v-model="customerState.billingBuildingNumber" class="w-full" />
                  </UFormField>
                  <UFormField label="Lokal" name="billingApartmentNumber">
                    <UInput v-model="customerState.billingApartmentNumber" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Opis adresu" name="billingAddress">
                  <UTextarea v-model="customerState.billingAddress" class="w-full" />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>

          <USlideover v-model:open="serviceOpen" title="Dodaj usługę">
            <UButton label="Dodaj usługę" icon="i-lucide-plus" />
            <template #body>
              <UForm
                :schema="serviceSchema"
                :state="serviceState"
                class="space-y-4"
                @submit="createService"
              >
                <UFormField label="Klient" name="customerId" required>
                  <USelect v-model="serviceState.customerId" :items="customerItems" class="w-full" />
                </UFormField>
                <UFormField label="Profil" name="profileId" required>
                  <USelect v-model="serviceState.profileId" :items="profileItems" class="w-full" />
                </UFormField>
                <UFormField label="Urządzenie CPE" name="equipmentId">
                  <USelect v-model="serviceState.equipmentId" :items="equipmentItems" class="w-full" />
                </UFormField>
                <UFormField label="Adres usługi z definicji" required>
                  <AddressAutocomplete
                    v-model="addressInput"
                    @update:model-value="selectedAddress = null"
                    @select="selectedAddress = $event"
                  />
                </UFormField>
                <UFormField label="Nr budynku" name="buildingNumber" required>
                  <UInput v-model="serviceState.buildingNumber" class="w-full" />
                </UFormField>
                <UFormField label="Lokal" name="apartmentNumber">
                  <UInput v-model="serviceState.apartmentNumber" class="w-full" />
                </UFormField>
                <UFormField label="Status" name="status">
                  <USelect v-model="serviceState.status" :items="['PENDING', 'ACTIVE']" class="w-full" />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6">
        <UAlert
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="CRM pokazuje dane opisowe"
          description="Kody TERYT/SIMC/ULIC są utrzymywane w definicjach i eksporcie PIT, a tutaj widoczne są nazwy i adresy czytelne dla operatora."
        />
      </div>
      <AppDataTable
        :data="rows"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły klienta"
        :subtitle="selectedRow?.fullName"
        :item="selectedRow"
      />
      <UModal v-model:open="archiveOpen" title="Archiwizuj klienta">
        <template #body>
          <div class="space-y-4">
            <UAlert color="warning" variant="subtle" title="Klient zostanie ukryty z listy domyślnej." />
            <UTextarea v-model="archiveReason" placeholder="Powód archiwizacji" class="w-full" />
          </div>
        </template>
        <template #footer>
          <UButton
            label="Anuluj"
            color="neutral"
            variant="subtle"
            @click="archiveOpen = false"
          />
          <UButton
            label="Archiwizuj"
            color="error"
            icon="i-lucide-archive"
            @click="archiveCustomer"
          />
        </template>
      </UModal>

      <UModal v-model:open="portalAccessOpen" title="Dostęp do portalu klienta">
        <template #body>
          <div class="space-y-4">
            <div v-if="portalAccessLoading" class="flex items-center justify-center py-8">
              <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
            </div>
            <template v-else-if="portalAccessData">
              <UAlert
                color="warning"
                variant="subtle"
                icon="i-lucide-alert-triangle"
                :title="portalAccessData.message"
              />
              <div class="space-y-3">
                <UFormField label="Login">
                  <UInput :model-value="portalAccessData.login" readonly class="w-full">
                    <template #trailing>
                      <UButton
                        icon="i-lucide-copy"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click="copyToClipboard(portalAccessData.login)"
                      />
                    </template>
                  </UInput>
                </UFormField>
                <UFormField label="Hasło">
                  <UInput :model-value="portalAccessData.password" readonly class="w-full">
                    <template #trailing>
                      <UButton
                        icon="i-lucide-copy"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click="copyToClipboard(portalAccessData.password)"
                      />
                    </template>
                  </UInput>
                </UFormField>
              </div>
            </template>
          </div>
        </template>
        <template #footer>
          <UButton
            label="Zamknij"
            color="neutral"
            variant="subtle"
            @click="portalAccessOpen = false"
          />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

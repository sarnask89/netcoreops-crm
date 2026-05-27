<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const _props = withDefaults(defineProps<{
  value: Record<string, unknown>
  depth?: number
}>(), {
  depth: 0
})

const maxDepth = 8
const collapsed = ref<Set<string>>(new Set())
const collapsedTables = ref<Set<string>>(new Set())

function toggleCollapse(key: string) {
  if (collapsed.value.has(key)) {
    collapsed.value.delete(key)
  } else {
    collapsed.value.add(key)
  }
}

function toggleTable(key: string) {
  if (collapsedTables.value.has(key)) {
    collapsedTables.value.delete(key)
  } else {
    collapsedTables.value.add(key)
  }
}

function isDateString(val: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
}

function isIsoDateOnly(val: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(val)
}

function formatLabel(key: string): string {
  const label = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim()

  const common: Record<string, string> = {
    'Id': 'ID',
    'Url': 'URL',
    'Ip': 'IP',
    'Mac': 'MAC',
    'Vlan': 'VLAN',
    'Pesel': 'PESEL',
    'Regon': 'REGON',
    'Krs': 'KRS',
    'Nip': 'NIP',
    'Olt': 'OLT',
    'Onu': 'ONU',
    'Pon': 'PON',
    'Cpe': 'CPE',
    'Fdb': 'FDB',
    'Arp': 'ARP',
    'Dhcp': 'DHCP',
    'Ssh': 'SSH',
    'Http': 'HTTP',
    'Https': 'HTTPS',
    'Snmp': 'SNMP',
    'Uuid': 'UUID',
    'Rbac': 'RBAC',
    'Pit': 'PIT',
    'Uke': 'UKE',
    'Teryt': 'TERYT',
    'Simc': 'SIMC',
    'Ulic': 'ULIC',
    'Is Active': 'Aktywne',
    'Bridge Mode': 'Tryb mostu',
    'Created At': 'Utworzono',
    'Updated At': 'Zaktualizowano',
    'Last Seen At': 'Ostatnio widziany',
    'Serial Number': 'Numer seryjny',
    'Inventory Id': 'Identyfikator',
    'Management Ip': 'IP zarządzania',
    'Management Port': 'Port zarządzania',
    'Management Protocol': 'Protokół zarządzania',
    'Mac Address': 'Adres MAC',
    'Host Name': 'Nazwa hosta',
    'Hostname': 'Hostname',
    'Full Name': 'Nazwa',
    'First Name': 'Imię',
    'Last Name': 'Nazwisko',
    'Company Name': 'Nazwa firmy',
    'Contact Email': 'Email',
    'Contact Phone': 'Telefon',
    'Billing Address': 'Adres klienta',
    'Billing Building Number': 'Nr budynku',
    'Billing Apartment Number': 'Lokal',
    'Tax Id': 'NIP',
    'Customer Type': 'Typ klienta',
    'Identity Document Number': 'Dokument tożsamości',
    'Representative Name': 'Osoba reprezentująca',
    'Equipment Role': 'Rola',
    'Access Profile': 'Profil dostępowy',
    'Management Driver': 'Sterownik zarządzania',
    'Parent Equipment': 'Urządzenie nadrzędne',
    'Variable Name': 'Nazwa zmiennej',
    'Value Type': 'Typ wartości',
    'Source Type': 'Źródło',
    'Table Name': 'Tabela',
    'Row Lookup Column': 'Kolumna wyszukiwania',
    'Row Lookup Value': 'Wartość wyszukiwania',
    'Field Name': 'Pole',
    'Static Value': 'Wartość stała',
    'Fallback Value': 'Wartość domyślna',
    'Sort Order': 'Kolejność',
    'Profile Bindings': 'Powiązania profili',
    'Linked Customer Names': 'Powiązani klienci',
    'Equipment Id': 'ID urządzenia',
    'Customer Id': 'ID klienta',
    'Service Id': 'ID usługi',
    'Profile Id': 'ID profilu',
    'Model Id': 'ID modelu',
    'Node Id': 'ID węzła',
    'Current Ip': 'Bieżący IP',
    'Signal Rx': 'Sygnał RX',
    'Onu Identifier': 'Identyfikator ONU',
    'Olt Inventory Id': 'Identyfikator OLT',
    'Pon Port Code': 'Kod portu PON',
    'Transparent Candidate': 'Kandydat do bridge',
    'Access Macs': 'MAC dostępowe',
    'Management Macs': 'MAC zarządzania',
    'Management Ip Hosts': 'IP-host (VLAN 400)',
    'Transparent Links': 'Transparent bridge',
    'Linked Customer': 'Powiązany klient',
    'Network Equipment': 'Urządzenie sieciowe',
    'Customer Device Id': 'ID urządzenia klienta',
    'Network Equipment Id': 'ID urządzenia sieciowego'
  }

  return common[label] || label
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Tak' : 'Nie'
  if (typeof val === 'object') return ''
  if (typeof val === 'string') {
    if (isDateString(val)) {
      return new Date(val).toLocaleString('pl-PL')
    }
    if (isIsoDateOnly(val)) {
      return new Date(val + 'T00:00:00').toLocaleDateString('pl-PL')
    }
  }
  return String(val)
}

function isExpandable(val: unknown): boolean {
  return val !== null && val !== undefined && typeof val === 'object'
}

function isSimpleObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function isNonEmptyArray(val: unknown): val is unknown[] {
  return Array.isArray(val) && val.length > 0
}

function isSimpleArray(arr: unknown[]): boolean {
  return !arr.some(item => item !== null && typeof item === 'object')
}

function getObjectKeys(val: Record<string, unknown>): string[] {
  return Object.keys(val).filter(k => !k.startsWith('_'))
}

function getArrayColumns(arr: Record<string, unknown>[]): TableColumn<Record<string, unknown>>[] {
  const keySet = new Set<string>()
  for (const item of arr) {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => keySet.add(k))
    }
  }
  return Array.from(keySet).map(accessorKey => ({
    accessorKey,
    header: formatLabel(accessorKey)
  }))
}

function formatArrayItem(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Tak' : 'Nie'
  if (typeof val === 'object') return JSON.stringify(val)
  if (typeof val === 'string') {
    if (isDateString(val)) return new Date(val).toLocaleString('pl-PL')
    if (isIsoDateOnly(val)) return new Date(val + 'T00:00:00').toLocaleDateString('pl-PL')
  }
  return String(val)
}

function prettyType(val: unknown): string {
  if (val === null) return 'puste'
  if (Array.isArray(val)) return `tablica[${val.length}]`
  if (typeof val === 'object') return 'obiekt'
  return typeof val
}
</script>

<template>
  <div class="divide-y divide-default">
    <template v-for="key in getObjectKeys(_props.value)" :key="key">
      <div class="flex items-start gap-3 px-4 py-2.5">
        <!-- Label -->
        <div class="w-2/5 shrink-0 text-sm font-medium text-highlighted pt-0.5">
          {{ formatLabel(key) }}
        </div>

        <!-- Value -->
        <div class="flex-1 min-w-0">
          <!-- Null/empty -->
          <div v-if="_props.value[key] === null || _props.value[key] === undefined" class="text-sm text-muted italic">
            —
          </div>

          <!-- Boolean -->
          <div v-else-if="typeof _props.value[key] === 'boolean'" class="text-sm">
            <UBadge :color="_props.value[key] ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ _props.value[key] ? 'Tak' : 'Nie' }}
            </UBadge>
          </div>

          <!-- Simple value (string, number) -->
          <div v-else-if="!isExpandable(_props.value[key])" class="text-sm text-default break-words">
            {{ formatValue(_props.value[key]) }}
          </div>

          <!-- Empty array -->
          <div v-else-if="Array.isArray(_props.value[key]) && _props.value[key].length === 0" class="text-sm text-muted italic">
            pusta lista
          </div>

          <!-- Simple array (array of primitives) -->
          <div v-else-if="isNonEmptyArray(_props.value[key]) && isSimpleArray(_props.value[key])" class="space-y-1">
            <div v-for="(v, i) in (_props.value[key] as unknown[])" :key="i" class="text-sm text-default bg-elevated/50 px-2 py-1 rounded">
              {{ formatArrayItem(v) }}
            </div>
          </div>

          <!-- Array of objects -> table -->
          <div v-else-if="isNonEmptyArray(_props.value[key]) && !isSimpleArray(_props.value[key])" class="border border-default rounded-md overflow-hidden">
            <button
              class="flex w-full items-center justify-between gap-2 bg-elevated/50 px-3 py-1.5 text-xs font-medium text-muted hover:bg-elevated/70 transition-colors"
              @click="toggleTable(key)"
            >
              <span>{{ (_props.value[key] as unknown[]).length }} elementów</span>
              <UIcon
                :name="collapsedTables.has(key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
                class="w-3.5 h-3.5"
              />
            </button>
            <div v-if="!collapsedTables.has(key)" class="overflow-x-auto">
              <UTable
                :data="_props.value[key] as Record<string, unknown>[]"
                :columns="getArrayColumns(_props.value[key] as Record<string, unknown>[])"
                :ui="{
                  base: 'min-w-full',
                  th: 'h-9 px-2.5 py-1.5 text-xs uppercase tracking-wide text-muted',
                  td: 'px-2.5 py-1.5 text-xs text-default truncate max-w-[200px]'
                }"
              >
                <template #empty>
                  <div class="py-6 text-center text-xs text-muted">
                    Brak danych
                  </div>
                </template>
              </UTable>
            </div>
          </div>

          <!-- Nested object -->
          <div v-else-if="isSimpleObject(_props.value[key])" class="border border-default rounded-md overflow-hidden">
            <button
              v-if="_props.depth < maxDepth"
              class="flex w-full items-center justify-between gap-2 bg-elevated/50 px-3 py-1.5 text-xs font-medium text-muted hover:bg-elevated/70 transition-colors"
              @click="toggleCollapse(key)"
            >
              <span>Obiekt — {{ getObjectKeys(_props.value[key] as Record<string, unknown>).length }} pól</span>
              <UIcon
                :name="collapsed.has(key) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
                class="w-3.5 h-3.5"
              />
            </button>
            <div v-if="!collapsed.has(key) && _props.depth < maxDepth">
              <AppObjectView :value="_props.value[key] as Record<string, unknown>" :depth="_props.depth + 1" />
            </div>
            <div v-else-if="_props.depth >= maxDepth" class="px-3 py-2 text-xs text-muted">
              {{ prettyType(_props.value[key]) }} — zbyt głęboko
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

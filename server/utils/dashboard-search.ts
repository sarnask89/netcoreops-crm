export interface DashboardSearchItem {
  label: string
  suffix?: string
  icon?: string
  to: string
  target?: string
}

interface DashboardFunctionSearchItem extends DashboardSearchItem {
  aliases: string[]
}

export const dashboardFunctionSearchItems: DashboardFunctionSearchItem[] = [{
  label: '@ Definicje zmiennych automatyzacji',
  suffix: 'Funkcja',
  icon: 'i-lucide-braces',
  to: '/automation/definitions',
  aliases: ['automatyzacja', 'automation', 'definicje', 'zmienne', 'variables', 'template', 'render']
}, {
  label: '@ Skrypty automatyzacji',
  suffix: 'Funkcja',
  icon: 'i-lucide-file-terminal',
  to: '/automation/scripts',
  aliases: ['automatyzacja', 'automation', 'skrypty', 'scripts', 'commands', 'konfiguracja']
}, {
  label: '@ Eksport PIT CSV',
  suffix: 'Funkcja',
  icon: 'i-lucide-download',
  to: '/api/pit/export',
  target: '_blank',
  aliases: ['pit', 'uke', 'csv', 'eksport', 'export']
}, {
  label: '@ Słowniki UKE',
  suffix: 'Słownik',
  icon: 'i-lucide-book-open',
  to: '/system/dictionaries',
  aliases: ['slowniki', 'słowniki', 'uke', 'teryt', 'simc', 'ulic', 'dictionary', 'dictionaries']
}, {
  label: '@ Walidacja PIT',
  suffix: 'Funkcja',
  icon: 'i-lucide-shield-check',
  to: '/pit/validation',
  aliases: ['pit', 'uke', 'walidacja', 'validation', 'validate']
}, {
  label: '@ Klienci CRM',
  suffix: 'Trasa',
  icon: 'i-lucide-user-round',
  to: '/crm/customers',
  aliases: ['crm', 'klienci', 'customers', 'abonenci', 'adresy']
}, {
  label: '@ Urządzenia klienta',
  suffix: 'Trasa',
  icon: 'i-lucide-router',
  to: '/crm/customer-devices',
  aliases: ['crm', 'cpe', 'onu', 'customer devices', 'urzadzenia klienta', 'urządzenia klienta']
}, {
  label: '@ Urządzenia sieciowe',
  suffix: 'Trasa',
  icon: 'i-lucide-server',
  to: '/network/equipment',
  aliases: ['network', 'sieć', 'siec', 'equipment', 'urzadzenia', 'urządzenia', 'mikrotik', 'dasan']
}, {
  label: '@ Profile dostępowe',
  suffix: 'Trasa',
  icon: 'i-lucide-sliders-horizontal',
  to: '/network/access-profiles',
  aliases: ['profile', 'access profiles', 'dostęp', 'dostep', 'credentials']
}, {
  label: '@ Generator modułów',
  suffix: 'Narzędzie',
  icon: 'i-lucide-blocks',
  to: '/tools/module-generator',
  aliases: ['generator', 'module generator', 'moduly', 'moduły', 'tools', 'narzędzia', 'narzedzia']
}]

export function normalizeDashboardSearchTerm(rawTerm: string) {
  const term = rawTerm.trim()
  return (term.startsWith('@') ? term.slice(1) : term).trim().toLowerCase()
}

export function filterDashboardFunctionSearchItems(rawTerm: string): DashboardSearchItem[] {
  const term = normalizeDashboardSearchTerm(rawTerm)

  if (!term) {
    return []
  }

  return dashboardFunctionSearchItems
    .filter(item => [item.label, item.suffix, item.to, ...item.aliases]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .some(value => value.toLowerCase().includes(term)))
    .map(item => ({
      label: item.label,
      suffix: item.suffix,
      icon: item.icon,
      to: item.to,
      target: item.target
    }))
}

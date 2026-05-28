<script setup lang="ts">
const state = reactive<Record<string, boolean>>({
  gponRxAlerts: true,
  diagnostics: true,
  imports: true,
  browser: false,
  systemConsole: false
})

const sections = [{
  title: 'Kanały powiadomień',
  description: 'Sposób prezentowania zdarzeń operatorowi.',
  fields: [{
    name: 'gponRxAlerts',
    label: 'Alerty GPON RX',
    description: 'Pokazuj alerty ONU poza zakresem mocy w panelu i powiadomieniach.'
  }, {
    name: 'diagnostics',
    label: 'Diagnostyka urządzeń',
    description: 'Pokazuj wyniki diagnostyki MikroTik/Dasan jako zdarzenia operacyjne.'
  }, {
    name: 'imports',
    label: 'Importy',
    description: 'Pokazuj zakończone importy DHCP, FTTH i słowników.'
  }, {
    name: 'browser',
    label: 'Powiadomienia systemowe',
    description: 'Rezerwacja pod lokalne powiadomienia przeglądarki.'
  }, {
    name: 'systemConsole',
    label: 'Konsola systemowa',
    description: 'Pokaż globalny slideover z błędami backendu i zmianami w bazie danych.'
  }]
}]

function onChange() {
  localStorage.setItem('netcoreops-notification-settings', JSON.stringify(state))
  localStorage.setItem('netcoreops-console-enabled', String(Boolean(state.systemConsole)))
  window.dispatchEvent(new Event('netcoreops-console-setting-changed'))
}

onMounted(() => {
  const stored = localStorage.getItem('netcoreops-notification-settings')
  if (!stored) return
  Object.assign(state, JSON.parse(stored))
  const consoleSetting = localStorage.getItem('netcoreops-console-enabled')
  if (consoleSetting != null) state.systemConsole = consoleSetting === 'true'
})
</script>

<template>
  <div v-for="section in sections" :key="section.title">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="state[field.name]"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>

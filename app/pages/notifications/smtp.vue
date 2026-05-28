<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface SmtpRow {
  id: number
  name: string
  host: string
  port: number
  username: string
  fromName?: string | null
  fromEmail: string
  encryption: string
  isDefault: boolean
  isActive: boolean
}

const toast = useToast()
const open = ref(false)
const editOpen = ref(false)
const selectedRow = ref<SmtpRow | null>(null)
const editingId = ref<number | null>(null)
const query = ref('')

const schema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
  fromName: z.string().optional(),
  fromEmail: z.string().email(),
  encryption: z.enum(['tls', 'ssl', 'none']),
  isDefault: z.boolean(),
  isActive: z.boolean()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ port: 587, encryption: 'tls', isDefault: false, isActive: true })
const editState = reactive<Partial<Schema>>({})

const { data, status, refresh } = await useFetch<{ success: boolean, data: SmtpRow[] }>('/api/notifications/smtp', {
  default: () => ({ success: false, data: [] })
})

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(r => [r.name, r.host, r.fromEmail].some(v => v.toLowerCase().includes(q)))
})

const columns: TableColumn<SmtpRow>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'host', header: 'Host' },
  { accessorKey: 'port', header: 'Port' },
  { accessorKey: 'fromEmail', header: 'Email nadawcy' },
  { accessorKey: 'isDefault', header: 'Domyślna' },
  { accessorKey: 'isActive', header: 'Aktywna' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, { name: undefined, host: undefined, port: 587, username: undefined, password: undefined, fromName: undefined, fromEmail: undefined, encryption: 'tls', isDefault: false, isActive: true })
  Object.assign(editState, {})
}

function openEdit(row: SmtpRow) {
  editingId.value = row.id
  selectedRow.value = row
  Object.assign(editState, {
    name: row.name,
    host: row.host,
    port: row.port,
    username: row.username,
    fromName: row.fromName || undefined,
    fromEmail: row.fromEmail,
    encryption: row.encryption as 'tls' | 'ssl' | 'none',
    isDefault: row.isDefault,
    isActive: row.isActive
  })
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/notifications/smtp', { method: 'POST', body: event.data })
    toast.add({ title: 'Dodano konfigurację SMTP', color: 'success' })
    open.value = false
    resetForm()
    refresh()
  } catch { /* toast handled by apiHandler */ }
}

async function onEdit(event: FormSubmitEvent<Schema>) {
  if (!editingId.value) return
  try {
    await $fetch(`/api/notifications/smtp/${editingId.value}`, { method: 'PATCH', body: event.data })
    toast.add({ title: 'Zaktualizowano konfigurację SMTP', color: 'success' })
    editOpen.value = false
    resetForm()
    refresh()
  } catch { /* handled */ }
}

async function setDefault(row: SmtpRow) {
  try {
    await $fetch('/api/notifications/smtp/default', { method: 'POST', body: { id: row.id } })
    toast.add({ title: 'Ustawiono domyślną konfigurację', color: 'success' })
    refresh()
  } catch { /* handled */ }
}

async function testSmtp(row: SmtpRow) {
  const email = window.prompt('Podaj adres e-mail do testu:')
  if (!email) return
  try {
    await $fetch('/api/notifications/smtp/test', { method: 'POST', body: { id: row.id, to: email } })
    toast.add({ title: `Test wysłany na ${email}`, color: 'success' })
  } catch { /* handled */ }
}

async function deleteRow(row: SmtpRow) {
  try {
    await $fetch(`/api/notifications/smtp/${row.id}`, { method: 'DELETE' })
    toast.add({ title: 'Usunięto konfigurację', color: 'success' })
    refresh()
  } catch { /* handled */ }
}

function rowContextItems(row: SmtpRow): ContextMenuItem[] {
  return [
    { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
    { label: 'Ustaw jako domyślną', icon: 'i-lucide-star', onSelect: () => setDefault(row), disabled: row.isDefault },
    { label: 'Testuj', icon: 'i-lucide-send', onSelect: () => testSmtp(row) },
    { label: 'Usuń', icon: 'i-lucide-trash-2', onSelect: () => deleteRow(row) }
  ]
}
</script>

<template>
  <UDashboardPanel id="notifications-smtp">
    <template #header>
      <UDashboardNavbar title="Konfiguracja SMTP">
        <template #leading>
          <UButton
            to="/notifications"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
          />
        </template>
        <template #right>
          <UButton color="primary" label="Dodaj konfigurację" @click="open = true" />
        </template>
      </UDashboardNavbar>
    </template>

    <UDashboardToolbar>
      <template #left>
        <UDashboardSearch v-model="query" placeholder="Szukaj..." />
      </template>
    </UDashboardToolbar>

    <AppDataTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      :row-context-items="rowContextItems"
    >
      <template #cell-isDefault="{ row }">
        <UBadge v-if="row.original.isDefault" color="primary" variant="solid">
          Domyślna
        </UBadge>
        <span v-else class="text-muted-foreground">—</span>
      </template>
      <template #cell-isActive="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="soft">
          {{ row.original.isActive ? 'Aktywna' : 'Nieaktywna' }}
        </UBadge>
      </template>
    </AppDataTable>

    <USlideover v-model:open="open">
      <template #title>
        Dodaj konfigurację SMTP
      </template>
      <template #body>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField label="Host" name="host" required>
            <UInput v-model="state.host" class="w-full" />
          </UFormField>
          <UFormField label="Port" name="port" required>
            <UInput v-model="state.port" type="number" class="w-full" />
          </UFormField>
          <UFormField label="Użytkownik" name="username" required>
            <UInput v-model="state.username" class="w-full" />
          </UFormField>
          <UFormField label="Hasło" name="password" required>
            <UInput v-model="state.password" type="password" class="w-full" />
          </UFormField>
          <UFormField label="Nazwa nadawcy" name="fromName">
            <UInput v-model="state.fromName" class="w-full" />
          </UFormField>
          <UFormField label="Email nadawcy" name="fromEmail" required>
            <UInput v-model="state.fromEmail" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Szyfrowanie" name="encryption" required>
            <USelect v-model="state.encryption" :items="[{ label: 'TLS', value: 'tls' }, { label: 'SSL', value: 'ssl' }, { label: 'Brak', value: 'none' }]" class="w-full" />
          </UFormField>
          <UFormField label="Domyślna" name="isDefault">
            <UCheckbox v-model="state.isDefault" />
          </UFormField>
          <UFormField label="Aktywna" name="isActive">
            <UCheckbox v-model="state.isActive" />
          </UFormField>
          <UButton
            type="submit"
            color="primary"
            label="Zapisz"
            class="mt-4"
          />
        </UForm>
      </template>
    </USlideover>

    <USlideover v-model:open="editOpen">
      <template #title>
        Edytuj konfigurację SMTP
      </template>
      <template #body>
        <UForm :schema="schema" :state="editState" @submit="onEdit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="editState.name" class="w-full" />
          </UFormField>
          <UFormField label="Host" name="host" required>
            <UInput v-model="editState.host" class="w-full" />
          </UFormField>
          <UFormField label="Port" name="port" required>
            <UInput v-model="editState.port" type="number" class="w-full" />
          </UFormField>
          <UFormField label="Użytkownik" name="username" required>
            <UInput v-model="editState.username" class="w-full" />
          </UFormField>
          <UFormField label="Hasło" name="password">
            <UInput
              v-model="editState.password"
              type="password"
              class="w-full"
              placeholder="Pozostaw puste jeśli bez zmian"
            />
          </UFormField>
          <UFormField label="Nazwa nadawcy" name="fromName">
            <UInput v-model="editState.fromName" class="w-full" />
          </UFormField>
          <UFormField label="Email nadawcy" name="fromEmail" required>
            <UInput v-model="editState.fromEmail" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Szyfrowanie" name="encryption" required>
            <USelect v-model="editState.encryption" :items="[{ label: 'TLS', value: 'tls' }, { label: 'SSL', value: 'ssl' }, { label: 'Brak', value: 'none' }]" class="w-full" />
          </UFormField>
          <UFormField label="Domyślna" name="isDefault">
            <UCheckbox v-model="editState.isDefault" />
          </UFormField>
          <UFormField label="Aktywna" name="isActive">
            <UCheckbox v-model="editState.isActive" />
          </UFormField>
          <UButton
            type="submit"
            color="primary"
            label="Zapisz"
            class="mt-4"
          />
        </UForm>
      </template>
    </USlideover>
  </UDashboardPanel>
</template>

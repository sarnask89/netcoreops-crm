<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface RuleRow {
  id: number
  name: string
  eventType: string
  template?: { id: number, name: string } | null
  recipients: Array<{ type: string, value?: string }>
  conditions: Record<string, unknown>
  enabled: boolean
}

interface NotificationRecipient {
  type: 'customer' | 'admin' | 'email'
  value?: string
}

interface TemplateOpt {
  id: number
  name: string
}

const toast = useToast()
const open = ref(false)
const editOpen = ref(false)
const selectedRow = ref<RuleRow | null>(null)
const editingId = ref<number | null>(null)
const query = ref('')

const schema = z.object({
  name: z.string().min(1),
  eventType: z.enum(['ticket_created', 'ticket_reply', 'invoice_issued', 'payment_received', 'payment_overdue', 'subscription_expiring']),
  templateId: z.number().int().positive().optional(),
  recipients: z.array(z.object({
    type: z.enum(['customer', 'admin', 'email']),
    value: z.string().optional()
  })).min(1),
  enabled: z.boolean()
})
type Schema = z.output<typeof schema>

const eventTypeLabels: Record<string, string> = {
  ticket_created: 'Nowe zgłoszenie',
  ticket_reply: 'Odpowiedź w zgłoszeniu',
  invoice_issued: 'Wystawiono fakturę',
  payment_received: 'Otrzymano płatność',
  payment_overdue: 'Zaległa płatność',
  subscription_expiring: 'Kończąca się subskrypcja'
}

const state = reactive<Partial<Schema>>({ eventType: 'ticket_created', recipients: [{ type: 'customer' }], enabled: true })
const editState = reactive<Partial<Schema>>({})

const { data, status, refresh } = await useFetch<{ success: boolean, data: RuleRow[] }>('/api/notifications/rules', {
  default: () => ({ success: false, data: [] })
})
const { data: templatesData } = await useFetch<{ success: boolean, data: TemplateOpt[] }>('/api/notifications/templates', {
  default: () => ({ success: false, data: [] })
})

const templateOptions = computed(() => (templatesData.value.data || []).map(t => ({ label: t.name, value: t.id })))

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(r => [r.name, r.eventType, r.template?.name].some(v => v?.toLowerCase().includes(q)))
})

const columns: TableColumn<RuleRow>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'eventType', header: 'Zdarzenie' },
  { accessorKey: 'template.name', header: 'Szablon' },
  { accessorKey: 'recipients', header: 'Odbiorcy' },
  { accessorKey: 'enabled', header: 'Aktywna' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, { name: undefined, eventType: 'ticket_created', templateId: undefined, recipients: [{ type: 'customer' }], enabled: true })
  Object.assign(editState, {})
}

function openEdit(row: RuleRow) {
  editingId.value = row.id
  selectedRow.value = row
  Object.assign(editState, {
    name: row.name,
    eventType: row.eventType as Schema['eventType'],
    templateId: row.template?.id ?? undefined,
    recipients: row.recipients,
    enabled: row.enabled
  })
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/notifications/rules', { method: 'POST', body: event.data })
    toast.add({ title: 'Dodano regułę', color: 'success' })
    open.value = false
    resetForm()
    refresh()
  } catch { /* handled */ }
}

async function onEdit(event: FormSubmitEvent<Schema>) {
  if (!editingId.value) return
  try {
    await $fetch(`/api/notifications/rules/${editingId.value}`, { method: 'PATCH', body: event.data })
    toast.add({ title: 'Zaktualizowano regułę', color: 'success' })
    editOpen.value = false
    resetForm()
    refresh()
  } catch { /* handled */ }
}

async function deleteRow(row: RuleRow) {
  try {
    await $fetch(`/api/notifications/rules/${row.id}`, { method: 'DELETE' })
    toast.add({ title: 'Usunięto regułę', color: 'success' })
    refresh()
  } catch { /* handled */ }
}

function rowContextItems(row: RuleRow): ContextMenuItem[][] {
  return [
    [
      { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
      { label: 'Usuń', icon: 'i-lucide-trash-2', onSelect: () => deleteRow(row) }
    ]
  ]
}

function recipientLabel(r: { type: string, value?: string }): string {
  if (r.type === 'customer') return 'Klient'
  if (r.type === 'admin') return 'Admin'
  return r.value || ''
}

const recipientTypeOptions = [
  { label: 'Klient', value: 'customer' },
  { label: 'Admin', value: 'admin' },
  { label: 'Adres e-mail', value: 'email' }
]

function updateRecipientType(recipients: NotificationRecipient[] | undefined, index: number, type: string) {
  const recipient = recipients?.[index]
  if (!recipient || (type !== 'customer' && type !== 'admin' && type !== 'email')) return
  recipient.type = type
  if (type !== 'email') recipient.value = undefined
}

function updateRecipientValue(recipients: NotificationRecipient[] | undefined, index: number, value: string) {
  const recipient = recipients?.[index]
  if (!recipient) return
  recipient.value = value
}
</script>

<template>
  <UDashboardPanel id="notifications-rules">
    <template #header>
      <UDashboardNavbar title="Reguły powiadomień">
        <template #leading>
          <UButton
            to="/notifications"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
          />
        </template>
        <template #right>
          <UButton color="primary" label="Nowa reguła" @click="open = true" />
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
      <template #cell-eventType="{ row }">
        <UBadge color="info" variant="soft">
          {{ eventTypeLabels[row.original.eventType] || row.original.eventType }}
        </UBadge>
      </template>
      <template #cell-recipients="{ row }">
        <div class="flex gap-1 flex-wrap">
          <UBadge
            v-for="r in row.original.recipients"
            :key="r.type + (r.value || '')"
            color="neutral"
            variant="soft"
          >
            {{ recipientLabel(r) }}
          </UBadge>
        </div>
      </template>
      <template #cell-enabled="{ row }">
        <UBadge :color="row.original.enabled ? 'success' : 'neutral'" variant="soft">
          {{ row.original.enabled ? 'Aktywna' : 'Nieaktywna' }}
        </UBadge>
      </template>
    </AppDataTable>

    <USlideover v-model:open="open">
      <template #title>
        Nowa reguła powiadomienia
      </template>
      <template #body>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField label="Typ zdarzenia" name="eventType" required>
            <USelect v-model="state.eventType" :items="Object.entries(eventTypeLabels).map(([value, label]) => ({ label, value }))" class="w-full" />
          </UFormField>
          <UFormField label="Szablon" name="templateId">
            <USelect v-model="(state.templateId as number | undefined)" :items="templateOptions" class="w-full" />
          </UFormField>
          <UFormField label="Odbiorcy" name="recipients" required>
            <div class="space-y-2 w-full">
              <div v-for="(_, idx) in state.recipients || []" :key="idx" class="flex gap-2 items-start">
                <USelect
                  :model-value="state.recipients?.[idx]?.type"
                  :items="recipientTypeOptions"
                  class="w-32"
                  @update:model-value="(value: string) => updateRecipientType(state.recipients, idx, value)"
                />
                <UInput
                  v-if="state.recipients?.[idx]?.type === 'email'"
                  :model-value="state.recipients?.[idx]?.value"
                  placeholder="adres e-mail"
                  class="flex-1"
                  @update:model-value="(value: string) => updateRecipientValue(state.recipients, idx, value)"
                />
                <UButton
                  color="error"
                  icon="i-lucide-x"
                  size="sm"
                  variant="ghost"
                  @click="state.recipients!.splice(idx, 1)"
                />
              </div>
              <UButton
                color="primary"
                variant="outline"
                size="sm"
                label="Dodaj odbiorcę"
                @click="state.recipients!.push({ type: 'email', value: '' })"
              />
            </div>
          </UFormField>
          <UFormField label="Aktywna" name="enabled">
            <UCheckbox v-model="state.enabled" />
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

    <USlideover :open="editingId !== null && !open" @update:open="(value: boolean) => { if (!value) editingId = null }">
      <template #title>
        Edytuj regułę
      </template>
      <template #body>
        <UForm :schema="schema" :state="editState" @submit="onEdit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="editState.name" class="w-full" />
          </UFormField>
          <UFormField label="Typ zdarzenia" name="eventType" required>
            <USelect v-model="editState.eventType" :items="Object.entries(eventTypeLabels).map(([value, label]) => ({ label, value }))" class="w-full" />
          </UFormField>
          <UFormField label="Szablon" name="templateId">
            <USelect v-model="editState.templateId" :items="templateOptions" class="w-full" />
          </UFormField>
          <UFormField label="Odbiorcy" name="recipients" required>
            <div class="space-y-2 w-full">
              <div v-for="(_, idx) in editState.recipients || []" :key="idx" class="flex gap-2 items-start">
                <USelect
                  :model-value="editState.recipients?.[idx]?.type"
                  :items="recipientTypeOptions"
                  class="w-32"
                  @update:model-value="(value: string) => updateRecipientType(editState.recipients, idx, value)"
                />
                <UInput
                  v-if="editState.recipients?.[idx]?.type === 'email'"
                  :model-value="editState.recipients?.[idx]?.value"
                  placeholder="adres e-mail"
                  class="flex-1"
                  @update:model-value="(value: string) => updateRecipientValue(editState.recipients, idx, value)"
                />
                <UButton
                  color="error"
                  icon="i-lucide-x"
                  size="sm"
                  variant="ghost"
                  @click="editState.recipients!.splice(idx, 1)"
                />
              </div>
              <UButton
                color="primary"
                variant="outline"
                size="sm"
                label="Dodaj odbiorcę"
                @click="editState.recipients!.push({ type: 'email', value: '' })"
              />
            </div>
          </UFormField>
          <UFormField label="Aktywna" name="enabled">
            <UCheckbox v-model="editState.enabled" />
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

<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface TemplateRow {
  id: number
  name: string
  code: string
  subject: string
  bodyHtml: string
  variables?: Array<{ name: string, label: string }>
  smtpConfig?: { id: number, name: string } | null
  isActive: boolean
}

interface SmtpConfigOpt {
  id: number
  name: string
}

const toast = useToast()
const open = ref(false)
const editOpen = ref(false)
const previewOpen = ref(false)
const previewData = ref({ subject: '', html: '' })
const selectedRow = ref<TemplateRow | null>(null)
const editingId = ref<number | null>(null)
const query = ref('')

const schema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  smtpConfigId: z.number().int().positive().optional(),
  isActive: z.boolean()
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ isActive: true, smtpConfigId: undefined })
const editState = reactive<Partial<Schema>>({})

const { data, status, refresh } = await useFetch<{ success: boolean, data: TemplateRow[] }>('/api/notifications/templates', {
  default: () => ({ success: false, data: [] })
})
const { data: smtpData } = await useFetch<{ success: boolean, data: SmtpConfigOpt[] }>('/api/notifications/smtp', {
  default: () => ({ success: false, data: [] })
})

const smtpOptions = computed(() => (smtpData.value.data || []).map(c => ({ label: c.name, value: c.id })))

const rows = computed(() => {
  const all = data.value.data || []
  if (!query.value) return all
  const q = query.value.toLowerCase()
  return all.filter(r => [r.name, r.code, r.subject].some(v => v.toLowerCase().includes(q)))
})

const columns: TableColumn<TemplateRow>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'code', header: 'Kod' },
  { accessorKey: 'subject', header: 'Temat' },
  { accessorKey: 'smtpConfig.name', header: 'Konfiguracja SMTP' },
  { accessorKey: 'isActive', header: 'Aktywny' }
]

function resetForm() {
  editingId.value = null
  selectedRow.value = null
  Object.assign(state, { name: undefined, code: undefined, subject: undefined, bodyHtml: undefined, smtpConfigId: undefined, isActive: true })
  Object.assign(editState, {})
}

function openEdit(row: TemplateRow) {
  editingId.value = row.id
  selectedRow.value = row
  Object.assign(editState, {
    name: row.name,
    code: row.code,
    subject: row.subject,
    bodyHtml: row.bodyHtml,
    smtpConfigId: row.smtpConfig?.id ?? undefined,
    isActive: row.isActive
  })
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/notifications/templates', { method: 'POST', body: event.data })
    toast.add({ title: 'Dodano szablon', color: 'success' })
    open.value = false
    resetForm()
    refresh()
  } catch { /* handled */ }
}

async function onEdit(event: FormSubmitEvent<Schema>) {
  if (!editingId.value) return
  try {
    await $fetch(`/api/notifications/templates/${editingId.value}`, { method: 'PATCH', body: event.data })
    toast.add({ title: 'Zaktualizowano szablon', color: 'success' })
    editOpen.value = false
    resetForm()
    refresh()
  } catch { /* handled */ }
}

async function preview(row: TemplateRow) {
  try {
    const res = await $fetch<{ success: boolean, data: { subject: string, html: string } }>(`/api/notifications/templates/${row.id}/preview`, { method: 'POST', body: { variables: {} } })
    previewData.value = res.data
    previewOpen.value = true
  } catch { /* handled */ }
}

async function deleteRow(row: TemplateRow) {
  try {
    await $fetch(`/api/notifications/templates/${row.id}`, { method: 'DELETE' })
    toast.add({ title: 'Usunięto szablon', color: 'success' })
    refresh()
  } catch { /* handled */ }
}

function rowContextItems(row: TemplateRow): ContextMenuItem[][] {
  return [
    [
      { label: 'Podgląd', icon: 'i-lucide-eye', onSelect: () => preview(row) },
      { label: 'Edytuj', icon: 'i-lucide-pencil', onSelect: () => openEdit(row) },
      { label: 'Usuń', icon: 'i-lucide-trash-2', onSelect: () => deleteRow(row) }
    ]
  ]
}
</script>

<template>
  <UDashboardPanel id="notifications-templates">
    <template #header>
      <UDashboardNavbar title="Szablony e-mail">
        <template #leading>
          <UButton
            to="/notifications"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
          />
        </template>
        <template #right>
          <UButton color="primary" label="Nowy szablon" @click="open = true" />
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
      <template #cell-isActive="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="soft">
          {{ row.original.isActive ? 'Aktywny' : 'Nieaktywny' }}
        </UBadge>
      </template>
      <template #cell-smtpConfig-name="{ row }">
        <span>{{ row.original.smtpConfig?.name || '—' }}</span>
      </template>
    </AppDataTable>

    <USlideover v-model:open="open">
      <template #title>
        Nowy szablon
      </template>
      <template #body>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField label="Kod" name="code" required>
            <UInput v-model="state.code" class="w-full" placeholder="np. invoice_issued" />
          </UFormField>
          <UFormField label="Temat" name="subject" required>
            <UInput v-model="state.subject" class="w-full" />
          </UFormField>
          <UFormField label="Treść HTML" name="bodyHtml" required>
            <UTextarea v-model="state.bodyHtml" class="w-full font-mono" :rows="12" />
          </UFormField>
          <UFormField label="Konfiguracja SMTP" name="smtpConfigId">
            <USelect v-model="state.smtpConfigId" :items="smtpOptions" class="w-full" />
          </UFormField>
          <UFormField label="Aktywny" name="isActive">
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

    <USlideover :open="editingId !== null && !open" @update:open="(value: boolean) => { if (!value) editingId = null }">
      <template #title>
        Edytuj szablon
      </template>
      <template #body>
        <UForm :schema="schema" :state="editState" @submit="onEdit">
          <UFormField label="Nazwa" name="name" required>
            <UInput v-model="editState.name" class="w-full" />
          </UFormField>
          <UFormField label="Kod" name="code" required>
            <UInput v-model="editState.code" class="w-full" />
          </UFormField>
          <UFormField label="Temat" name="subject" required>
            <UInput v-model="editState.subject" class="w-full" />
          </UFormField>
          <UFormField label="Treść HTML" name="bodyHtml" required>
            <UTextarea v-model="editState.bodyHtml" class="w-full font-mono" :rows="12" />
          </UFormField>
          <UFormField label="Konfiguracja SMTP" name="smtpConfigId">
            <USelect v-model="editState.smtpConfigId" :items="smtpOptions" class="w-full" />
          </UFormField>
          <UFormField label="Aktywny" name="isActive">
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

    <UModal v-model:open="previewOpen">
      <template #title>
        Podgląd szablonu
      </template>
      <template #body>
        <div class="space-y-4">
          <div>
            <span class="font-semibold">Temat:</span>
            <p>{{ previewData.subject }}</p>
          </div>
          <div>
            <span class="font-semibold">Treść:</span>
            <!-- eslint-disable-next-line vue/no-v-html -- Admin-only email template preview must render stored HTML. -->
            <div class="border rounded p-4 mt-2" v-html="previewData.html" />
          </div>
        </div>
      </template>
    </UModal>
  </UDashboardPanel>
</template>

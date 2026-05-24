<script setup lang="ts">
import * as z from 'zod'
import type { ContextMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'

interface AccessProfileRow {
  id: number
  name: string
  description?: string | null
  defaultProtocol: string
  defaultPort?: number | null
  username?: string | null
  apiBaseUrl?: string | null
  snmpCommunityEncrypted?: string | null
  isActive: boolean
  equipment?: unknown[]
  automationScripts?: unknown[]
}

const toast = useToast()
const profileOpen = ref(false)
const detailsOpen = ref(false)
const selectedRow = ref<AccessProfileRow | null>(null)
const editingProfileId = ref<number | null>(null)

const profileSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  defaultProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf', 'routeros']),
  defaultPort: z.number().int().positive().max(65535).nullable().optional(),
  username: z.string().optional(),
  passwordEncrypted: z.string().optional(),
  snmpCommunityEncrypted: z.string().optional(),
  apiBaseUrl: z.string().optional(),
  apiTokenEncrypted: z.string().optional(),
  sshKeyEncrypted: z.string().optional(),
  isActive: z.boolean()
})

type ProfileSchema = z.output<typeof profileSchema>

const profileState = reactive<Partial<ProfileSchema>>({
  defaultProtocol: 'ssh',
  defaultPort: 22,
  isActive: true
})

const { data, status, refresh } = await useFetch<{ success: boolean, data: AccessProfileRow[] }>('/api/network/access-profiles', {
  default: () => ({ success: false, data: [] })
})

const columns: TableColumn<AccessProfileRow>[] = [
  { accessorKey: 'name', header: 'Profil' },
  { accessorKey: 'defaultProtocol', header: 'Protokół' },
  { accessorKey: 'defaultPort', header: 'Port' },
  { accessorKey: 'username', header: 'Login' },
  {
    id: 'secrets',
    header: 'Sekrety',
    cell: ({ row }) => [
      row.original.snmpCommunityEncrypted ? 'SNMP' : null,
      row.original.apiBaseUrl ? 'API' : null
    ].filter(Boolean).join(', ') || 'SSH/hasło'
  },
  {
    id: 'equipment',
    header: 'Urządzenia',
    cell: ({ row }) => `${row.original.equipment?.length || 0}`
  },
  {
    id: 'enabled',
    header: 'Aktywny',
    cell: ({ row }) => row.original.isActive ? 'Tak' : 'Nie'
  }
]

function resetProfileForm() {
  editingProfileId.value = null
  selectedRow.value = null
  Object.assign(profileState, {
    name: undefined,
    description: undefined,
    defaultProtocol: 'ssh',
    defaultPort: 22,
    username: undefined,
    passwordEncrypted: undefined,
    snmpCommunityEncrypted: undefined,
    apiBaseUrl: undefined,
    apiTokenEncrypted: undefined,
    sshKeyEncrypted: undefined,
    isActive: true
  })
}

function openCreateProfile() {
  resetProfileForm()
  profileOpen.value = true
}

function openEditProfile(row: AccessProfileRow) {
  selectedRow.value = row
  editingProfileId.value = row.id
  Object.assign(profileState, {
    name: row.name,
    description: row.description || undefined,
    defaultProtocol: row.defaultProtocol as ProfileSchema['defaultProtocol'],
    defaultPort: row.defaultPort || undefined,
    username: row.username || undefined,
    snmpCommunityEncrypted: undefined,
    apiBaseUrl: row.apiBaseUrl || undefined,
    isActive: row.isActive
  })
  profileOpen.value = true
}

async function saveProfile(event: FormSubmitEvent<ProfileSchema>) {
  await $fetch(editingProfileId.value ? `/api/network/access-profiles/${editingProfileId.value}` : '/api/network/access-profiles', {
    method: editingProfileId.value ? 'PATCH' : 'POST',
    body: {
      ...event.data,
      defaultPort: event.data.defaultPort || null,
      description: event.data.description || null,
      username: event.data.username || null,
      passwordEncrypted: event.data.passwordEncrypted || null,
      snmpCommunityEncrypted: event.data.snmpCommunityEncrypted || null,
      apiBaseUrl: event.data.apiBaseUrl || null,
      apiTokenEncrypted: event.data.apiTokenEncrypted || null,
      sshKeyEncrypted: event.data.sshKeyEncrypted || null
    }
  })
  toast.add({ title: 'Profil zarządzania zapisany', color: 'success' })
  profileOpen.value = false
  resetProfileForm()
  await refresh()
}

async function deleteProfile(row: AccessProfileRow) {
  if (!window.confirm(`Usunąć profil ${row.name}?`)) return
  await $fetch(`/api/network/access-profiles/${row.id}`, { method: 'DELETE' })
  toast.add({ title: 'Profil usunięty', color: 'success' })
  await refresh()
}

function showDetails(row: AccessProfileRow) {
  selectedRow.value = row
  detailsOpen.value = true
}

function rowContextItems(row: AccessProfileRow): ContextMenuItem[][] {
  return [[
    { label: 'Edytuj profil', icon: 'i-lucide-pencil', onSelect: () => openEditProfile(row) },
    { label: 'Szczegóły profilu', icon: 'i-lucide-panel-right-open', onSelect: () => showDetails(row) },
    { label: 'Usuń profil', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => deleteProfile(row) },
    { label: 'Odśwież', icon: 'i-lucide-refresh-cw', onSelect: () => refresh() }
  ]]
}
</script>

<template>
  <UDashboardPanel id="network-access-profiles" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
    <template #header>
      <UDashboardNavbar title="Profile dostępowe sprzętu">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USlideover v-model:open="profileOpen" :title="editingProfileId ? 'Edytuj profil' : 'Dodaj profil zarządzania'">
            <UButton label="Dodaj profil" icon="i-lucide-key-round" @click="openCreateProfile" />
            <template #body>
              <UForm
                :schema="profileSchema"
                :state="profileState"
                class="space-y-4"
                @submit="saveProfile"
              >
                <UFormField label="Nazwa" name="name" required>
                  <UInput v-model="profileState.name" class="w-full" />
                </UFormField>
                <UFormField label="Opis" name="description">
                  <UTextarea v-model="profileState.description" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Protokół domyślny" name="defaultProtocol">
                    <USelect
                      v-model="profileState.defaultProtocol"
                      :items="['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf', 'routeros']"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Port" name="defaultPort">
                    <UInputNumber v-model="profileState.defaultPort" class="w-full" />
                  </UFormField>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Login" name="username">
                    <UInput v-model="profileState.username" class="w-full" />
                  </UFormField>
                  <UFormField label="Hasło / sekret" name="passwordEncrypted">
                    <UInput v-model="profileState.passwordEncrypted" type="password" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="SNMP community" name="snmpCommunityEncrypted">
                  <UInput v-model="profileState.snmpCommunityEncrypted" type="password" class="w-full" />
                </UFormField>
                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="API endpoint" name="apiBaseUrl">
                    <UInput v-model="profileState.apiBaseUrl" class="w-full" />
                  </UFormField>
                  <UFormField label="API token" name="apiTokenEncrypted">
                    <UInput v-model="profileState.apiTokenEncrypted" type="password" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="SSH key" name="sshKeyEncrypted">
                  <UTextarea v-model="profileState.sshKeyEncrypted" class="w-full font-mono" :rows="5" />
                </UFormField>
                <UFormField label="Aktywny" name="isActive">
                  <USwitch v-model="profileState.isActive" />
                </UFormField>
                <UButton type="submit" label="Zapisz" icon="i-lucide-save" />
              </UForm>
            </template>
          </USlideover>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <AppDataTable
        :data="data.data"
        :columns="columns"
        :loading="status === 'pending'"
        :context-items="rowContextItems"
      />
      <AppRowDetailsSlideover
        v-model:open="detailsOpen"
        title="Szczegóły profilu"
        :subtitle="selectedRow?.name"
        :item="selectedRow"
      />
    </template>
  </UDashboardPanel>
</template>

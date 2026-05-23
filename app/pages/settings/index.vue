<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const fileRef = ref<HTMLInputElement>()

const profileSchema = z.object({
  name: z.string().min(2, 'Za krótka nazwa'),
  email: z.string().email('Nieprawidłowy email'),
  username: z.string().min(2, 'Za krótki login'),
  avatar: z.string().optional(),
  bio: z.string().optional()
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  name: 'Administrator',
  email: 'admin@local.netcoreops',
  username: 'admin',
  avatar: undefined,
  bio: 'Lokalne konto operatora NetCoreOps'
})
const toast = useToast()
const { data: account } = await useFetch<{ success: boolean, data: { name: string, email: string, username: string, role: string } }>('/api/account/me')

watchEffect(() => {
  if (!account.value?.data) return
  profile.name = account.value.data.name
  profile.email = account.value.data.email
  profile.username = account.value.data.username
  profile.bio = account.value.data.role
})

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  toast.add({
    title: 'Zapisano ustawienia',
    description: 'Profil lokalny został zaktualizowany w bieżącej sesji.',
    icon: 'i-lucide-check',
    color: 'success'
  })
  console.log(event.data)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  profile.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Konto lokalne"
      description="Informacje pokazywane w dolnym menu użytkownika i ustawieniach operatora."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Zapisz zmiany"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Nazwa"
        description="Widoczna w menu użytkownika i logach operatora."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Lokalny adres kontaktowy operatora."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Login"
        description="Nazwa lokalnego użytkownika systemowego albo operatora aplikacji."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.username"
          type="username"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="Lokalny plik JPG lub PNG."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profile.avatar"
            :alt="profile.name"
            size="lg"
          />
          <UButton
            label="Wybierz"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Rola"
        description="Opis roli lokalnego operatora."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profile.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>

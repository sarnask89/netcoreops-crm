<script setup lang="ts">
definePageMeta({ layout: false })

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const toast = useToast()

const newPasswordError = computed(() => {
  if (newPassword.value && newPassword.value.length < 8) return 'Hasło musi mieć co najmniej 8 znaków'
  return undefined
})

const confirmError = computed(() => {
  if (confirmPassword.value && confirmPassword.value !== newPassword.value) return 'Hasła nie są zgodne'
  return undefined
})

const isValid = computed(() => {
  return currentPassword.value
    && newPassword.value.length >= 8
    && confirmPassword.value === newPassword.value
})

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    await $fetch('/api/portal/auth/password', {
      method: 'PUT',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      }
    })
    toast.add({ title: 'Hasło zostało zmienione', color: 'success' })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    toast.add({ title: 'Nie udało się zmienić hasła', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function logout() {
  await $fetch('/api/portal/auth/logout', { method: 'POST' })
  await navigateTo('/portal/login')
}
</script>

<template>
  <main class="min-h-screen bg-gray-950">
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UButton
            to="/portal"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-left"
          />
          <h1 class="font-semibold text-base">
            Zmiana hasła
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

    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="max-w-md">
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Ustaw nowe hasło
            </h2>
          </template>
          <form class="space-y-4" @submit.prevent="submit">
            <UFormGroup label="Obecne hasło" required>
              <UInput v-model="currentPassword" type="password" placeholder="Obecne hasło" />
            </UFormGroup>
            <UFormGroup
              label="Nowe hasło"
              required
              :error="newPasswordError"
            >
              <UInput v-model="newPassword" type="password" placeholder="Minimum 8 znaków" />
            </UFormGroup>
            <UFormGroup
              label="Powtórz nowe hasło"
              required
              :error="confirmError"
            >
              <UInput v-model="confirmPassword" type="password" placeholder="Powtórz hasło" />
            </UFormGroup>
            <UButton
              type="submit"
              label="Zmień hasło"
              color="primary"
              :loading="submitting"
              :disabled="!isValid"
              class="w-full"
            />
          </form>
        </UCard>
      </div>
    </div>
  </main>
</template>

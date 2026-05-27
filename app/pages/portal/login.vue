<script setup lang="ts">
definePageMeta({
  layout: false
})

const toast = useToast()
const route = useRoute()
const login = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await $fetch('/api/portal/auth/login', {
      method: 'POST',
      body: {
        login: login.value,
        password: password.value
      }
    })

    await navigateTo(typeof route.query.redirect === 'string' ? route.query.redirect : '/portal')
  } catch {
    toast.add({ title: 'Nieprawidłowy login lub hasło', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-gray-950 flex items-center justify-center p-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="space-y-1">
          <h1 class="text-lg font-semibold">
            Portal klienta
          </h1>
          <p class="text-sm text-muted">
            Zaloguj się, aby sprawdzić swoje usługi
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Login">
          <UInput v-model="login" autocomplete="username" class="w-full" />
        </UFormField>
        <UFormField label="Hasło">
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full"
            autofocus
          />
        </UFormField>
        <UButton
          type="submit"
          label="Zaloguj"
          icon="i-lucide-log-in"
          block
          :loading="loading"
        />
      </form>
    </UCard>
  </main>
</template>

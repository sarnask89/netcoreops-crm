<script setup lang="ts">
definePageMeta({
  layout: false
})

const toast = useToast()
const route = useRoute()
const username = ref('admin')
const password = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    await navigateTo(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
  } catch {
    toast.add({ title: 'Nieprawidłowy login lub hasło', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-default flex items-center justify-center p-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="space-y-1">
          <h1 class="text-lg font-semibold">
            NetCoreOps
          </h1>
          <p class="text-sm text-muted">
            Logowanie lokalnego operatora
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="login">
        <UFormField label="Login">
          <UInput v-model="username" autocomplete="username" class="w-full" />
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

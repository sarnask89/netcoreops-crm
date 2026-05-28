<script setup lang="ts">
definePageMeta({ layout: false })

const subject = ref('')
const categoryId = ref<number | undefined>(undefined)
const message = ref('')
const submitting = ref(false)
const sent = ref(false)
const toast = useToast()

const { data: categoriesData } = await useFetch<{ success: boolean, data: Array<{ id: number, name: string }> }>('/api/portal/helpdesk/categories', {
  default: () => ({ success: false, data: [] }),
  onResponseError: () => navigateTo('/portal/login')
})

const isValid = computed(() => {
  return subject.value.trim() && message.value.trim()
})

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    await $fetch('/api/portal/contact', {
      method: 'POST',
      body: {
        subject: subject.value,
        message: message.value,
        categoryId: categoryId.value
      }
    })
    sent.value = true
  } catch {
    toast.add({ title: 'Nie udało się wysłać wiadomości', color: 'error' })
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
            Kontakt
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
      <div v-if="sent" class="max-w-lg mx-auto text-center py-12">
        <UIcon name="i-lucide-check-circle" class="size-12 text-success mx-auto mb-4" />
        <h2 class="font-semibold text-lg mb-2">
          Wiadomość wysłana
        </h2>
        <p class="text-muted">
          Wysłaliśmy wiadomość. Odpowiemy najszybciej jak to możliwe.
        </p>
        <UButton
          label="Wyślij kolejną"
          color="primary"
          variant="outline"
          class="mt-6"
          @click="sent = false; subject = ''; categoryId = undefined; message = ''"
        />
      </div>

      <div v-else class="max-w-lg mx-auto">
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Formularz kontaktowy
            </h2>
          </template>
          <form class="space-y-4" @submit.prevent="submit">
            <UFormGroup label="Temat" required>
              <UInput v-model="subject" placeholder="Temat wiadomości" />
            </UFormGroup>
            <UFormGroup label="Kategoria">
              <USelect
                v-model="categoryId"
                :items="categoriesData.data?.map(c => ({ label: c.name, value: c.id })) || []"
                placeholder="Wybierz kategorię"
                clearable
              />
            </UFormGroup>
            <UFormGroup label="Wiadomość" required>
              <UTextarea v-model="message" :rows="6" placeholder="Treść wiadomości..." />
            </UFormGroup>
            <UButton
              type="submit"
              label="Wyślij"
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

<script setup lang="ts">
interface AddressSuggestion {
  label: string
  value: string
  terytCode: string
  simcCode: string
  ulicCode: string
  locality: string
  street: string
  streetType?: string
}

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  select: [suggestion: AddressSuggestion]
}>()

const listId = `address-${useId()}`
const suggestions = ref<AddressSuggestion[]>([])
let currentRequest = 0

const debouncedSearch = useDebounceFn(async (term: string) => {
  const request = ++currentRequest

  try {
    const response = await $fetch<{ success: boolean, data: AddressSuggestion[] }>('/api/addresses/search', {
      query: { q: term }
    })

    if (request !== currentRequest) {
      return
    }

    suggestions.value = response.data

    const selected = suggestions.value.find(item => item.label === term)
    if (selected) {
      emit('select', selected)
    }
  } catch {
    if (request === currentRequest) {
      suggestions.value = []
    }
  }
}, 150)

watch(model, (value) => {
  const term = value.trim()

  if (term.length < 2) {
    suggestions.value = []
    return
  }

  debouncedSearch(term)
})
</script>

<template>
  <div class="w-full">
    <UInput
      v-model="model"
      :list="listId"
      icon="i-lucide-map-pin"
      class="w-full"
      placeholder="Zacznij pisać ulicę lub kod ULIC"
    />
    <datalist :id="listId">
      <option
        v-for="suggestion in suggestions"
        :key="suggestion.label"
        :value="suggestion.label"
      />
    </datalist>
  </div>
</template>

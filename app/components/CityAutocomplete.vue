<script setup lang="ts">
interface CitySuggestion {
  source: 'operator' | 'simc'
  id: number
  name: string
  simcCode?: string
  localityType?: string
  label?: string
}

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  select: [suggestion: CitySuggestion]
}>()

const listId = `city-${useId()}`
const suggestions = ref<CitySuggestion[]>([])
let currentRequest = 0

const debouncedSearch = useDebounceFn(async (term: string) => {
  const request = ++currentRequest

  try {
    const response = await $fetch<{ success: boolean, data: CitySuggestion[] }>('/api/addresses/cities/search', {
      query: { q: term }
    })

    if (request === currentRequest) {
      suggestions.value = response.data
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

function onInput() {
  const val = model.value
  const selected = suggestions.value.find(
    item => item.label === val || item.name === val
  )
  if (selected) {
    emit('select', selected)
  }
}
</script>

<template>
  <div class="w-full">
    <UInput
      v-model="model"
      :list="listId"
      icon="i-lucide-city"
      class="w-full"
      placeholder="Zacznij pisać miasto lub kod SIMC"
      @update:model-value="onInput"
    />
    <datalist :id="listId">
      <option
        v-for="suggestion in suggestions"
        :key="`${suggestion.source}-${suggestion.id}`"
        :value="suggestion.source === 'simc' ? (suggestion.label || suggestion.name) : suggestion.name"
      >
        {{ suggestion.label || suggestion.name }}
      </option>
    </datalist>
  </div>
</template>

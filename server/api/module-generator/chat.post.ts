import { apiHandler } from '../../utils/api-handler'
import { readBody } from 'h3'
import { z } from 'zod'
import type { ModuleDefinition } from '../../../scripts/codegen/module-generator'
import { normalizeAiModuleDefinition } from '../../utils/module-generator-ai'

const roleSchema = z.enum(['user', 'assistant'])

const bodySchema = z.object({
  message: z.string().min(1),
  model: z.string().min(1).max(128).optional(),
  conversation: z.array(z.object({
    role: roleSchema,
    text: z.string().min(1)
  })).max(20).optional(),
  selectedSuggestions: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    category: z.enum(['module', 'route', 'integration', 'dictionary', 'automation'])
  })).max(20).optional(),
  currentDefinition: z.record(z.string(), z.any()).nullable().optional()
})

const ollamaResponseSchema = z.object({
  response: z.string()
})

const aiPayloadSchema = z.object({
  assistantMessage: z.string().min(1),
  nextQuestion: z.string().optional(),
  readyForPlan: z.boolean().optional(),
  suggestions: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    reason: z.string().min(1),
    category: z.enum(['module', 'route', 'integration', 'dictionary', 'automation'])
  })).optional(),
  definition: z.record(z.string(), z.any()).optional()
})

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'suggestion'
}

function fallbackSuggestions(definition: ModuleDefinition | null, message: string) {
  if (!definition) return []

  const base: Array<{
    id: string
    title: string
    reason: string
    category: 'module' | 'route' | 'integration' | 'dictionary' | 'automation'
  }> = [
    {
      id: sanitizeId(`${definition.module}-list-route`),
      title: `Dodaj route listy dla ${definition.title}`,
      reason: 'Ulatwia szybkie przejscie z wyszukiwarki dashboard do listy rekordow.',
      category: 'route'
    },
    {
      id: sanitizeId(`${definition.module}-details-route`),
      title: `Dodaj route szczegolow dla ${definition.title}`,
      reason: 'Przydaje sie do nawigacji z wynikow wyszukiwania i linkowania z innych modulow.',
      category: 'route'
    },
    {
      id: sanitizeId(`${definition.module}-automation-template`),
      title: `Dodaj szablon automatyzacji dla ${definition.title}`,
      reason: 'Pozwoli renderowac komendy/skrypty z danych tego modulu.',
      category: 'automation'
    }
  ]

  if (/crm|customer|klient|umow|contract/i.test(message)) {
    base.push({
      id: sanitizeId(`${definition.module}-customer-link`),
      title: 'Powiaz modul z klientem CRM',
      reason: 'Daje spojny widok klient -> uslugi -> rekordy modulu.',
      category: 'integration'
    })
  }

  if (/network|nms|gpon|onu|olt|ftth/i.test(message)) {
    base.push({
      id: sanitizeId(`${definition.module}-equipment-link`),
      title: 'Powiaz modul z urzadzeniem/equipment',
      reason: 'Umozliwia nawigacje i diagnostyke z poziomu NMS.',
      category: 'integration'
    })
  }

  return base.slice(0, 8)
}

function buildPrompt(input: z.infer<typeof bodySchema>) {
  return JSON.stringify({
    task: 'You are a NetCoreOps module generator copilot. Ask focused questions one-by-one, propose related modules/routes/integrations, and produce a valid ModuleDefinition JSON when enough information exists.',
    outputContract: {
      returnOnlyJsonObject: true,
      shape: {
        assistantMessage: 'string',
        nextQuestion: 'string optional',
        readyForPlan: 'boolean',
        suggestions: [{ id: 'string optional', title: 'string', reason: 'string', category: 'module|route|integration|dictionary|automation' }],
        definition: 'ModuleDefinition JSON optional'
      }
    },
    rules: [
      'Keep answers concise and practical.',
      'Always ask at most one next question.',
      'If information is sufficient, set readyForPlan=true and include definition.',
      'Suggestions should include related modules/routes, not only current module internals.',
      'Use categories exactly: module, route, integration, dictionary, automation.',
      'Definition must follow NetCoreOps generator constraints: module camelCase, tableName snake_case, route safe kebab-case segments, no id/createdAt/updatedAt in fields.'
    ],
    conversation: input.conversation || [],
    selectedSuggestions: input.selectedSuggestions || [],
    currentDefinition: input.currentDefinition || null,
    userMessage: input.message
  })
}

export default apiHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))

  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: body.model || 'netcoreops-module-coder',
      prompt: buildPrompt(body),
      stream: false,
      format: 'json',
      options: {
        temperature: 0,
        top_p: 0.5,
        num_ctx: 4096,
        num_predict: 1024,
        num_gpu: 999
      }
    })
  }).catch((error: unknown) => {
    throw createError({
      statusCode: 503,
      statusMessage: error instanceof Error ? error.message : 'Ollama service unavailable'
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: 503,
      statusMessage: `Ollama HTTP ${response.status}`
    })
  }

  const payload = ollamaResponseSchema.parse(await response.json())
  const rawJson = JSON.parse(payload.response) as Record<string, unknown>
  const parsedPayload = aiPayloadSchema.safeParse(rawJson)
  const aiPayload = parsedPayload.success
    ? parsedPayload.data
    : {
        assistantMessage: '',
        nextQuestion: undefined,
        readyForPlan: false,
        suggestions: undefined,
        definition: rawJson
      }
  let definition: ModuleDefinition | null = null

  if (aiPayload.definition) {
    try {
      definition = normalizeAiModuleDefinition(aiPayload.definition)
    } catch {
      definition = null
    }
  }

  const suggestionsFromAi = (aiPayload.suggestions || []).slice(0, 10).map((item, index) => ({
    id: sanitizeId(item.id || `${item.category}-${item.title}-${index}`),
    title: item.title.trim(),
    reason: item.reason.trim(),
    category: item.category
  }))
  const suggestions = suggestionsFromAi.length > 0 ? suggestionsFromAi : fallbackSuggestions(definition, body.message)

  return {
    success: true,
    data: {
      assistantMessage: aiPayload.assistantMessage || (definition
        ? 'Przygotowalem draft definicji. Sprawdz propozycje i doprecyzuj, jesli trzeba.'
        : 'Potrzebuje doprecyzowania. Odpowiedz na pytanie i sprobuje ponownie.'),
      nextQuestion: aiPayload.nextQuestion || null,
      readyForPlan: Boolean(aiPayload.readyForPlan && definition),
      suggestions,
      definition
    }
  }
})

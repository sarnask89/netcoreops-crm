import { readBody } from 'h3'
import { z } from 'zod'
import type { ModuleDefinition } from '../../../scripts/codegen/module-generator'
import { normalizeAiModuleDefinition } from '../../utils/module-generator-ai'

const roleSchema = z.enum(['user', 'assistant'])

const bodySchema = z.object({
  message: z.string().min(1),
  conversation: z.array(z.object({
    role: roleSchema,
    text: z.string().min(1)
  })).max(20).optional(),
  selectedSuggestions: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    category: z.enum(['module', 'route', 'integration', 'dictionary', 'automation'])
  })).max(20).optional(),
  currentDefinition: z.record(z.string(), z.any()).optional()
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

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))

  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'netcoreops-module-coder',
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
  const aiPayload = aiPayloadSchema.parse(JSON.parse(payload.response))
  let definition: ModuleDefinition | null = null

  if (aiPayload.definition) {
    try {
      definition = normalizeAiModuleDefinition(aiPayload.definition)
    } catch {
      definition = null
    }
  }

  const suggestions = (aiPayload.suggestions || []).slice(0, 10).map((item, index) => ({
    id: sanitizeId(item.id || `${item.category}-${item.title}-${index}`),
    title: item.title.trim(),
    reason: item.reason.trim(),
    category: item.category
  }))

  return {
    success: true,
    data: {
      assistantMessage: aiPayload.assistantMessage,
      nextQuestion: aiPayload.nextQuestion || null,
      readyForPlan: Boolean(aiPayload.readyForPlan && definition),
      suggestions,
      definition
    }
  }
})

import { apiHandler } from '../../utils/api-handler'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readBody } from 'h3'
import { z } from 'zod'
import { parseModuleDefinitionFile } from '../../../scripts/codegen/module-generator'
import { parseAiModuleJson } from '../../utils/module-generator-ai'

const bodySchema = z.object({
  input: z.string().min(1),
  format: z.enum(['json', 'xml']),
  validationErrors: z.array(z.string()).optional(),
  maxAttempts: z.number().int().min(1).max(3).optional()
})

const ollamaResponseSchema = z.object({
  response: z.string()
})

function buildPrompt(input: string, format: 'json' | 'xml', validationErrors: string[]) {
  return JSON.stringify({
    task: 'Repair this NetCoreOps module definition. Return only one valid JSON ModuleDefinition object. The definition will generate Nuxt 4, Nuxt UI, Drizzle/PostgreSQL, Zod validation, REST API handlers, and an AppDataTable CRUD page.',
    codeGenerationContract: {
      automaticFields: ['id', 'createdAt', 'updatedAt'],
      forbiddenFieldNames: ['id', 'createdAt', 'updatedAt'],
      supportedTypes: ['uuid', 'text', 'varchar', 'integer', 'number', 'boolean', 'timestamp', 'date', 'json', 'enum'],
      typeAliases: {
        decimal: 'number',
        double: 'number',
        float: 'number',
        string: 'varchar',
        object: 'json'
      }
    },
    repairInstructions: [
      'Fix module to camelCase.',
      'Fix tableName to snake_case.',
      'Fix route and page to safe kebab-case path segments.',
      'Remove path traversal, empty segments, backslashes, and absolute paths.',
      'Remove id, createdAt, and updatedAt fields because generated code creates them automatically.',
      'Remove or merge duplicate fields.',
      'Convert unsupported field types using typeAliases.',
      'Add values to enum fields.',
      'Return the smallest valid correction that preserves user intent.'
    ],
    inputFormat: format,
    validationErrors,
    input
  })
}

export default apiHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const attempts = body.maxAttempts || 3
  let lastError = 'Ollama repair did not return a valid module definition'

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'netcoreops-module-coder',
        prompt: buildPrompt(body.input, body.format, body.validationErrors || []),
        stream: false,
        format: 'json',
        options: {
          temperature: 0,
          top_p: 0.5,
          num_ctx: 2048,
          num_predict: 768,
          num_gpu: 999
        }
      })
    }).catch((error: unknown) => {
      lastError = error instanceof Error ? error.message : 'Ollama service unavailable'
      return null
    })

    if (!response) break
    if (!response.ok) {
      lastError = `Ollama HTTP ${response.status}`
      continue
    }

    const payload = ollamaResponseSchema.parse(await response.json())
    const directory = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-repair-'))
    const repairedPath = join(directory, `repair-${attempt}.json`)
    try {
      const repaired = parseAiModuleJson(payload.response)
      await writeFile(repairedPath, JSON.stringify(repaired), 'utf8')

      const definition = await parseModuleDefinitionFile(repairedPath)
      return {
        success: true,
        data: {
          attempts: attempt,
          definition
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Invalid repaired module definition'
    }
  }

  throw createError({
    statusCode: 503,
    statusMessage: lastError
  })
})

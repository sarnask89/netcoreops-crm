import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readBody } from 'h3'
import { z } from 'zod'
import { parseModuleDefinitionFile } from '../../../scripts/codegen/module-generator'

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
    task: 'Repair this NetCoreOps module definition. Return only one valid JSON ModuleDefinition object.',
    inputFormat: format,
    validationErrors,
    input
  })
}

export default defineEventHandler(async (event) => {
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
          temperature: 0.1
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
    await writeFile(repairedPath, payload.response, 'utf8')

    try {
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

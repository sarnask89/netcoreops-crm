import { apiHandler } from '../../utils/api-handler'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readBody } from 'h3'
import { z } from 'zod'
import { parseModuleDefinitionFile } from '../../../scripts/codegen/module-generator'
import { parseAiModuleJson } from '../../utils/module-generator-ai'

const bodySchema = z.object({
  prompt: z.string().min(1),
  validationErrors: z.array(z.string()).optional(),
  maxAttempts: z.number().int().min(1).max(3).optional()
})

const ollamaResponseSchema = z.object({
  response: z.string()
})

function buildPrompt(prompt: string, validationErrors: string[]) {
  return JSON.stringify({
    task: 'Create the first NetCoreOps ModuleDefinition draft from this product request. Return only one valid JSON ModuleDefinition object. The definition will generate Nuxt 4, Nuxt UI, Drizzle/PostgreSQL, Zod validation, REST API handlers, and an AppDataTable CRUD page.',
    codeGenerationContract: {
      generatedFiles: [
        'server/db/generated/<module>.ts',
        'server/utils/generated/<module>.validation.ts',
        'server/db/migrations/0000_<module>.sql',
        'server/api/<route>/index.get.ts',
        'server/api/<route>/index.post.ts',
        'server/api/<route>/[id].patch.ts',
        'server/api/<route>/[id].delete.ts',
        'app/pages/<route>.vue'
      ],
      automaticFields: ['id', 'createdAt', 'updatedAt'],
      supportedTypes: ['uuid', 'text', 'varchar', 'integer', 'number', 'boolean', 'timestamp', 'date', 'json', 'enum']
    },
    fieldDesignInstructions: [
      'Do not include automatic fields in fields: id, createdAt, updatedAt.',
      'Use varchar with max for short names, labels, hostnames, usernames, codes, and identifiers shown in forms.',
      'Use text for long notes, descriptions, script bodies, rendered commands, and comments.',
      'Use integer for ports, VLAN ids, priorities, whole-number limits, and counts.',
      'Use number for dBm, Mbps, latency, percentages, prices, and decimal measurements.',
      'Use boolean for enabled/disabled, active/inactive, device access, and feature flags.',
      'Use timestamp for last seen, last checked, started/finished, imported at, and event date-time fields.',
      'Use json for diagnostics, snapshots, raw external payloads, command results, evidence, and flexible metadata.',
      'Use enum for status, type, category, scope, trigger, severity, and state fields; enum values must be uppercase.',
      'Set list false for json, long text, and large payload fields.',
      'Set required true for status/type fields and data needed to create a valid record.',
      'Choose route by domain: network for NMS/FTTH, crm for customers/services, automation for scripts/templates, billing for financial records, tools for operational helpers.'
    ],
    validationErrors,
    rules: [
      'module must be camelCase',
      'tableName must be snake_case',
      'route/page must be safe kebab-case segments',
      'do not include id, createdAt, or updatedAt in fields',
      'use only supported field types',
      'enum fields require values'
    ],
    examples: [
      {
        request: 'GPON SLA monitor with status, RX power, diagnostic evidence and last check time',
        output: {
          module: 'gponSlaMonitor',
          title: 'GPON SLA Monitor',
          tableName: 'gpon_sla_monitors',
          route: 'network/gpon-sla-monitors',
          timestamps: true,
          fields: [
            { name: 'onuSerial', label: 'ONU Serial', type: 'varchar', required: true, max: 64, list: true, form: true },
            { name: 'slaState', label: 'SLA State', type: 'enum', values: ['OK', 'WARNING', 'CRITICAL'], required: true, list: true, form: true },
            { name: 'rxPowerDbm', label: 'RX Power dBm', type: 'number', required: true, list: true, form: true },
            { name: 'lastCheckedAt', label: 'Last Checked At', type: 'timestamp', required: false, list: true, form: true },
            { name: 'evidenceSnapshot', label: 'Evidence Snapshot', type: 'json', required: false, list: false, form: true }
          ]
        }
      }
    ],
    prompt
  })
}

export default apiHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const attempts = body.maxAttempts || 3
  const validationErrors = [...(body.validationErrors || [])]
  let lastError = 'Ollama did not return a valid module definition'

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'netcoreops-module-coder',
        prompt: buildPrompt(body.prompt, validationErrors),
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
      validationErrors.push(lastError)
      continue
    }

    const payload = ollamaResponseSchema.parse(await response.json())
    const directory = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-draft-'))
    const draftPath = join(directory, `draft-${attempt}.json`)

    try {
      const definition = parseAiModuleJson(payload.response)
      await writeFile(draftPath, JSON.stringify(definition), 'utf8')

      return {
        success: true,
        data: await parseModuleDefinitionFile(draftPath)
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Invalid drafted module definition'
      validationErrors.push(lastError)
    } finally {
      await rm(directory, {
        recursive: true,
        force: true
      })
    }
  }

  throw createError({
    statusCode: 503,
    statusMessage: lastError
  })
})

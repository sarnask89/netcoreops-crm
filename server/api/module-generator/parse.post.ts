import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readBody } from 'h3'
import { z } from 'zod'
import { parseModuleDefinitionFile } from '../../../scripts/codegen/module-generator'

const bodySchema = z.object({
  input: z.string().min(1),
  format: z.enum(['json', 'xml'])
})

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const directory = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
  const definitionPath = join(directory, `definition.${body.format}`)

  await writeFile(definitionPath, body.input, 'utf8')

  try {
    const definition = await parseModuleDefinitionFile(definitionPath)
    return { success: true, data: definition }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Nie mozna sparsowac definicji modulu'
    })
  }
})

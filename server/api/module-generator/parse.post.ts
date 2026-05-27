import { apiHandler } from '../../utils/api-handler'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { z } from 'zod'
import { parseModuleDefinitionFile } from '../../../scripts/codegen/module-generator'

const BodySchema = z.object({
  input: z.string().min(1),
  format: z.enum(['json', 'xml'])
})

export default apiHandler(async (event) => {
  const body = BodySchema.safeParse(await readBody(event))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: body.error.issues.map(issue => issue.message).join('; ')
    })
  }

  const dir = await mkdtemp(join(tmpdir(), 'netcoreops-module-generator-'))
  const filePath = join(dir, `definition.${body.data.format}`)

  try {
    await writeFile(filePath, body.data.input, 'utf8')

    const data = await parseModuleDefinitionFile(filePath)

    return {
      success: true,
      data
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : String(error)
    })
  } finally {
    await rm(dir, {
      recursive: true,
      force: true
    })
  }
})

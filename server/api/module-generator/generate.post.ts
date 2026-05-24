import { readBody } from 'h3'
import { z } from 'zod'
import { generateModulePlan, writeGeneratedFiles } from '../../../scripts/codegen/module-generator'

const bodySchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
  force: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const plan = await generateModulePlan({
    rootDir: process.cwd(),
    definitionPaths: body.paths,
    force: body.force
  })

  if (!plan.validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: plan.validation.errors.join('; ') || 'Walidacja generatora nie powiodla sie'
    })
  }

  await writeGeneratedFiles(plan.files, { force: body.force })

  return {
    success: true,
    data: {
      files: plan.files.map(file => file.path)
    }
  }
})

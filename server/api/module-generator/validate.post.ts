import { z } from 'zod'
import { generateModulePlan } from '../../../scripts/codegen/module-generator'

const BodySchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
  force: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const body = BodySchema.safeParse(await readBody(event))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: body.error.issues.map(issue => issue.message).join('; ')
    })
  }

  const plan = await generateModulePlan({
    rootDir: process.cwd(),
    definitionPaths: body.data.paths,
    force: body.data.force
  })

  return {
    success: plan.validation.success,
    data: plan.validation
  }
})

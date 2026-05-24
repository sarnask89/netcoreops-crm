import { readBody } from 'h3'
import { z } from 'zod'
import { generateModulePlan } from '../../../scripts/codegen/module-generator'

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

  return { success: plan.validation.success, data: plan.validation }
})

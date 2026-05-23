import { readBody } from 'h3'
import { automationVariableDefinitions } from '../../../db/schema'
import { createAutomationVariableDefinitionSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createAutomationVariableDefinitionSchema.parse(body)
  const [variable] = await db.insert(automationVariableDefinitions).values(payload).returning()

  return { success: true, data: variable }
})

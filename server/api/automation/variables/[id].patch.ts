import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { automationVariableDefinitions } from '../../../db/schema'
import { updateAutomationVariableDefinitionSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = updateAutomationVariableDefinitionSchema.parse(body)
  const [variable] = await db.update(automationVariableDefinitions)
    .set(payload)
    .where(eq(automationVariableDefinitions.id, id))
    .returning()

  return { success: true, data: variable }
})

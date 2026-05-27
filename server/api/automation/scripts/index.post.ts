import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { automationScripts } from '../../../db/schema'
import { createAutomationScriptSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createAutomationScriptSchema.parse(body)
  const [script] = await db.insert(automationScripts).values(payload).returning()

  return { success: true, data: script }
})

import { getRouterParam, readBody } from 'h3'
import { renderAutomationScriptSchema } from '../../../../utils/api-validation'
import { renderAutomationScript } from '../../../../utils/automation-render'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const payload = renderAutomationScriptSchema.parse(body || {})
  const rendered = await renderAutomationScript(id, payload.variables)

  return { success: true, data: rendered }
})

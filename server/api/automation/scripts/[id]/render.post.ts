import { apiHandler } from '../../../../utils/api-handler'
import { createError, getRouterParam, readBody } from 'h3'
import { renderAutomationScriptSchema } from '../../../../utils/api-validation'
import { renderAutomationScript } from '../../../../utils/automation-render'

export default apiHandler(async (event) => {
  const scriptId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(scriptId) || scriptId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid automation script id'
    })
  }

  const body = await readBody(event)
  const payload = renderAutomationScriptSchema.parse(body || {})
  const rendered = await renderAutomationScript(scriptId, payload.variables)

  return {
    success: true,
    data: {
      script: {
        id: rendered.script.id,
        name: rendered.script.name,
        scope: rendered.script.scope,
        triggerType: rendered.script.triggerType,
        scriptLanguage: rendered.script.scriptLanguage,
        timeoutSeconds: rendered.script.timeoutSeconds,
        isEnabled: rendered.script.isEnabled
      },
      variables: rendered.variables,
      renderedBody: rendered.renderedBody
    }
  }
})

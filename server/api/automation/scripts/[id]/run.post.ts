import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { automationScripts } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { executeAutomationScript } from '../../../../utils/automation-script-runner'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id skryptu' })

  const script = await db.query.automationScripts.findFirst({ where: eq(automationScripts.id, id) })
  if (!script) throw createError({ statusCode: 404, statusMessage: 'Skrypt nie istnieje' })

  const execution = await executeAutomationScript(script)
  if (!execution.success) {
    throw createError({
      statusCode: 500,
      statusMessage: execution.stderr || 'Skrypt zakończył się błędem'
    })
  }

  await db.update(automationScripts)
    .set({ lastRunAt: new Date() })
    .where(eq(automationScripts.id, script.id))

  return {
    success: true,
    data: {
      ...(execution.data && typeof execution.data === 'object' ? execution.data : {}),
      execution: {
        exitCode: execution.exitCode,
        stdout: execution.stdout,
        stderr: execution.stderr
      }
    }
  }
})

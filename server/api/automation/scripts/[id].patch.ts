import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { automationScripts } from '../../../db/schema'
import { updateAutomationScriptSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id skryptu' })

  const payload = updateAutomationScriptSchema.parse(await readBody(event))
  const [script] = await db.update(automationScripts)
    .set(definedEntries(payload))
    .where(eq(automationScripts.id, id))
    .returning()

  if (!script) throw createError({ statusCode: 404, statusMessage: 'Skrypt nie istnieje' })
  return { success: true, data: script }
})

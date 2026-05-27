import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { automationScripts } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id skryptu' })

  const [script] = await db.delete(automationScripts)
    .where(eq(automationScripts.id, id))
    .returning()

  if (!script) throw createError({ statusCode: 404, statusMessage: 'Skrypt nie istnieje' })
  return { success: true, data: script }
})

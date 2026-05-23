import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { automationVariableDefinitions } from '../../../db/schema'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await db.delete(automationVariableDefinitions).where(eq(automationVariableDefinitions.id, id))

  return { success: true }
})

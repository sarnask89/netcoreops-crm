import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const variables = await db.query.automationVariableDefinitions.findMany({
    orderBy: (table, { asc }) => [asc(table.variableName)]
  })

  return { success: true, data: variables }
})

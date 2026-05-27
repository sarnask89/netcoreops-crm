import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const scripts = await db.query.automationScripts.findMany({
    with: {
      profile: true,
      equipment: {
        with: {
          model: true,
          node: true
        }
      }
    },
    orderBy: (table, { asc }) => [asc(table.name)]
  })

  return { success: true, data: scripts }
})

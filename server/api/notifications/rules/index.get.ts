import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const rules = await db.query.notificationRules.findMany({
    with: { template: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })
  return { success: true, data: rules }
})

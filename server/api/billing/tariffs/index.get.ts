import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const tariffs = await db.query.tariffs.findMany({
    with: {
      subscriptions: true
    },
    orderBy: (table, { asc }) => [asc(table.name)]
  })

  return { success: true, data: tariffs }
})

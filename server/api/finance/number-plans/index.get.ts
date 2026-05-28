import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const result = await db.query.numberPlans.findMany({
    orderBy: (table, { asc }) => [asc(table.name)]
  })

  return { success: true, data: result }
})

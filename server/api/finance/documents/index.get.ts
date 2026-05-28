import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const documents = await db.query.documents.findMany({
    with: {
      customer: true,
      numberPlan: true
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: documents }
})

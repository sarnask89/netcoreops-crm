import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const result = await db.query.payments.findMany({
    with: {
      customer: true,
      document: true
    },
    orderBy: (table, { desc }) => [desc(table.paymentDate)]
  })

  return { success: true, data: result }
})

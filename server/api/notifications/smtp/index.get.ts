import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const configs = await db.query.smtpConfigs.findMany({
    orderBy: (table, { desc }) => [desc(table.isDefault), desc(table.createdAt)]
  })
  return { success: true, data: configs }
})

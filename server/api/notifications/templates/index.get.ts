import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const templates = await db.query.emailTemplates.findMany({
    with: { smtpConfig: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })
  return { success: true, data: templates }
})

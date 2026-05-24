import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const subscriptions = await db.query.subscriptions.findMany({
    with: {
      customer: true,
      customerDevice: true,
      tariff: true
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: subscriptions }
})

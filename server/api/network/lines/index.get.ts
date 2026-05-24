import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const lines = await db.query.networkLines.findMany({
    with: {
      startNode: true,
      endNode: true,
      medium: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })

  return { success: true, data: lines }
})

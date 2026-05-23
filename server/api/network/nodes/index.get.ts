import { eq } from 'drizzle-orm'
import { getQuery } from 'h3'
import { networkNodes } from '../../../db/schema'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = typeof query.type === 'string' ? query.type : undefined

  const nodes = await db.query.networkNodes.findMany({
    where: type ? eq(networkNodes.nodeType, type) : undefined,
    with: {
      medium: true,
      terytArea: true,
      simcLocality: true,
      street: true,
      equipment: true
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return { success: true, data: nodes }
})

import { getQuery } from 'h3'
import { z } from 'zod'
import { apiHandler } from '../../../utils/api-handler'
import { listConsoleEvents } from '../../../utils/system-console'

export default apiHandler((event) => {
  const query = getQuery(event)
  const { limit } = z.object({ limit: z.coerce.number().int().min(1).max(300).default(100) }).parse(query)
  return { success: true, data: listConsoleEvents(limit) }
})

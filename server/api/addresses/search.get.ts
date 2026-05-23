import { getQuery } from 'h3'
import { searchAddresses } from '../../utils/dictionaries'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const term = typeof query.q === 'string' ? query.q.trim() : ''

  if (term.length < 2) {
    return { success: true, data: [] }
  }

  return {
    success: true,
    data: await searchAddresses(term)
  }
})

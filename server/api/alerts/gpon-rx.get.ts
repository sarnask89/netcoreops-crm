import { getQuery } from 'h3'
import { loadRecentGponRxAlerts } from '../../ftth/gpon-rx-monitor'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit || 20)
  const alerts = await loadRecentGponRxAlerts(Number.isFinite(limit) ? limit : 20)

  return { success: true, data: alerts }
})

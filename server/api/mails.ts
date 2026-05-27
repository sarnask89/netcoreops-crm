import { apiHandler } from '../utils/api-handler'
import { loadRecentGponRxAlerts } from '../ftth/gpon-rx-monitor'

export default apiHandler(async () => {
  const alerts = await loadRecentGponRxAlerts(20)

  return alerts.map((alert, index) => ({
    id: index + 1,
    unread: true,
    from: {
      id: 1,
      name: alert.severity === 'critical' ? 'GPON RX krytyczny' : 'GPON RX ostrzeżenie',
      email: 'alerts@local.netcoreops',
      status: 'subscribed',
      location: alert.equipmentInventoryId
    },
    subject: alert.message,
    body: [
      `OLT: ${alert.equipmentInventoryId}`,
      `PON: ${alert.oltPort}`,
      `ONU: ${alert.onuIdentifier}`,
      `RX: ${alert.signalRx || 'Brak odczytu'}`,
      '',
      alert.message
    ].join('\n'),
    date: alert.createdAt.toISOString()
  }))
})

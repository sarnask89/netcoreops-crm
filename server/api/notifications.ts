import { loadRecentGponRxAlerts } from '../ftth/gpon-rx-monitor'

export default eventHandler(async () => {
  const alerts = await loadRecentGponRxAlerts(25)

  return alerts.map((alert, index) => ({
    id: index + 1,
    unread: true,
    sender: {
      name: alert.severity === 'critical' ? 'GPON RX krytyczny' : 'GPON RX ostrzeżenie'
    },
    body: alert.message,
    date: alert.createdAt.toISOString()
  }))
})

import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const session = getPortalSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Nieautoryzowany' })

  const [activeTariffs, subscriptions] = await Promise.all([
    db.query.tariffs.findMany({
      where: (table, { eq }) => eq(table.isActive, true),
      orderBy: (table, { asc }) => [asc(table.name)]
    }),
    db.query.subscriptions.findMany({
      where: (table, { eq }) => eq(table.customerId, session.customerId),
      columns: { tariffId: true }
    })
  ])

  const subscribedTariffIds = new Set(subscriptions.map(s => s.tariffId))

  const data = activeTariffs.map(t => ({
    id: t.id,
    name: t.name,
    serviceType: t.serviceType,
    defaultNetPrice: t.defaultNetPrice,
    vatRate: t.vatRate,
    downloadMbps: t.downloadMbps,
    uploadMbps: t.uploadMbps,
    description: t.description,
    isSubscribed: subscribedTariffIds.has(t.id)
  }))

  return { success: true, data }
})

import { getRouterParam } from 'h3'
import { diagnosticRuns } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia klienta' })

  const customerDevice = await db.query.customerDevices.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      customer: true,
      equipment: true,
      subscriptions: {
        with: {
          tariff: true
        }
      }
    }
  })
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })
  if (!customerDevice.equipmentId || !customerDevice.macAddress || !customerDevice.ipAddress) {
    throw createError({ statusCode: 422, statusMessage: 'Brak routera, MAC albo IP do synchronizacji lease' })
  }

  const subscription = customerDevice.subscriptions.find(item => item.status === 'ACTIVE' && item.tariff?.serviceType === 'internet')
  if (!subscription?.tariff) throw createError({ statusCode: 422, statusMessage: 'Brak aktywnej subskrypcji internetowej' })

  const upload = subscription.tariff.uploadMbps || 0
  const download = subscription.tariff.downloadMbps || 0
  const rateLimit = `${upload}M/${download}M`
  const { driver, driverCode } = await getDriverForEquipment(customerDevice.equipmentId)
  const check = await driver.upsertDhcpLease({
    macAddress: customerDevice.macAddress,
    ipAddress: customerDevice.ipAddress,
    comment: `CRM:${customerDevice.customerId} ${customerDevice.customer.fullName}`,
    rateLimit
  })
  const result = withDiagnosticPresentation('Synchronizacja DHCP lease', {
    success: check.status === 'ok',
    driver: driverCode,
    target: customerDevice.ipAddress,
    checks: [check],
    raw: { rateLimit, subscriptionId: subscription.id },
    errors: check.status === 'error' ? [check] : []
  })

  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: customerDevice.equipmentId,
    driverCode,
    runType: 'sync-lease',
    target: customerDevice.ipAddress,
    success: result.success,
    result
  })

  return { success: result.success, data: result }
})

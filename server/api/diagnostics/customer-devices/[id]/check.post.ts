import { apiHandler } from '../../../../utils/api-handler'
import { getRouterParam } from 'h3'
import { diagnosticRuns } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia klienta' })

  const customerDevice = await db.query.customerDevices.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      equipment: true,
      onuEquipment: {
        with: {
          parentEquipment: true
        }
      }
    }
  })
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })

  const managedEquipmentId = customerDevice.equipmentId || customerDevice.onuEquipment?.parentEquipmentId
  if (!managedEquipmentId) throw createError({ statusCode: 422, statusMessage: 'Brak urządzenia zarządzającego dla diagnostyki' })

  const { driver, driverCode } = await getDriverForEquipment(managedEquipmentId)
  const target = customerDevice.ipAddress || customerDevice.hostname
  const mac = customerDevice.macAddress
  const checks = []

  if (target) {
    checks.push(await driver.ping(target))
    checks.push(await driver.arpPing(target))
  }
  if (mac) {
    checks.push(await driver.getDhcpLease(mac))
    checks.push(await driver.getBridgeHost(mac))
    checks.push(await driver.getSwitchFdb(mac))
  }

  const success = checks.some(check => check.status === 'ok')
  const result = withDiagnosticPresentation('Ping / ARP / DHCP', { success, driver: driverCode, target, checks, errors: checks.filter(check => check.status === 'error') })

  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: managedEquipmentId,
    driverCode,
    runType: 'customer-device-check',
    target,
    success,
    result
  })

  return { success, data: result }
})

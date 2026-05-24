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
      onuEquipment: {
        with: {
          parentEquipment: true
        }
      }
    }
  })
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })
  if (!customerDevice.onuEquipment?.parentEquipmentId || !customerDevice.onuEquipment.onuPort || !customerDevice.onuEquipment.onuId) {
    throw createError({ statusCode: 422, statusMessage: 'Urządzenie nie jest powiązane z ONU/OLT' })
  }

  const onu = customerDevice.onuEquipment
  const parentEquipmentId = onu.parentEquipmentId
  const onuPort = onu.onuPort
  const onuId = onu.onuId
  if (!parentEquipmentId) throw createError({ statusCode: 422, statusMessage: 'ONU nie ma powiązanego OLT' })
  if (!onuPort || !onuId) throw createError({ statusCode: 422, statusMessage: 'ONU nie ma portu albo identyfikatora' })

  const { driver, driverCode } = await getDriverForEquipment(parentEquipmentId)
  const onuInfo = await driver.getOnuInfo(onuPort, onuId)
  const macTable = await driver.getOnuMacTable(onuPort, onuId)
  const result = withDiagnosticPresentation('OLT lookup', {
    success: onuInfo.status === 'ok',
    driver: driverCode,
    target: `${onuPort}/${onuId}`,
    checks: [onuInfo, { name: 'onu-mac-table', status: 'ok' as const, data: macTable }],
    raw: { onu, macTable },
    errors: onuInfo.status === 'error' ? [onuInfo] : []
  })

  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: parentEquipmentId,
    driverCode,
    runType: 'olt-lookup',
    target: result.target,
    success: result.success,
    result
  })

  return { success: result.success, data: result }
})

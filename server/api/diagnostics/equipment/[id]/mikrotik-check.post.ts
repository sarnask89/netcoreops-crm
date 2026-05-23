import { getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { withDiagnosticPresentation } from '../../../../utils/diagnostic-presentation'
import { getDriverForEquipment } from '../../../../utils/network-driver-context'

const bodySchema = z.object({
  macAddress: z.string().max(17).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia' })

  const body = bodySchema.parse(await readBody(event).catch(() => ({})))
  const { driver, driverCode, equipment } = await getDriverForEquipment(id)
  const leases = await driver.getLeases()
  const sample = body.macAddress || body.ipAddress
    ? leases.find(lease => lease.macAddress?.toLowerCase() === body.macAddress?.toLowerCase() || lease.address === body.ipAddress)
    : leases.find(lease => lease.macAddress && lease.address && !lease.disabled && !lease.blocked) || leases.find(lease => lease.macAddress && lease.address)

  const macAddress = body.macAddress || sample?.macAddress
  const ipAddress = body.ipAddress || sample?.address
  const checks = []
  if (macAddress) checks.push(await driver.getDhcpLease(macAddress))
  if (ipAddress) {
    checks.push(await driver.ping(ipAddress))
    checks.push(await driver.arpPing(ipAddress))
  }

  const data = withDiagnosticPresentation('Ping / ARP / DHCP', {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: { macAddress, ipAddress },
    leaseCount: leases.length,
    checks
  })

  return {
    success: checks.some(check => check.status === 'ok'),
    data
  }
})

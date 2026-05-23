import 'dotenv/config'
import { db, pool } from '../server/utils/db'
import { getDriverForEquipment } from '../server/utils/network-driver-context'

function maskMac(mac?: string | null) {
  if (!mac) return null
  const normalized = mac.toLowerCase()
  return `${normalized.slice(0, 2)}:**:**:**:${normalized.slice(-5)}`
}

function rowValue(data: unknown, key: string) {
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>)[key] : null
}

async function main() {
  const inventories = process.argv.slice(2)
  const targetInventories = inventories.length ? inventories : ['MT-10-0-222-86', 'MT-10-0-222-4']
  const targets = await db.query.networkEquipment.findMany({
    where: (table, { inArray }) => inArray(table.inventoryId, targetInventories)
  })
  const results = []

  for (const target of targets) {
    const { driver, driverCode } = await getDriverForEquipment(target.id)
    const leases = await driver.getLeases()
    const sample = leases.find(lease => lease.macAddress && lease.address && !lease.disabled && !lease.blocked)
      || leases.find(lease => lease.macAddress && lease.address)

    if (!sample?.macAddress || !sample.address) {
      results.push({ inventoryId: target.inventoryId, driver: driverCode, error: 'Brak lease z MAC i IP' })
      continue
    }

    const dhcpLease = await driver.getDhcpLease(sample.macAddress)
    const ping = await driver.ping(sample.address)
    const arpPing = await driver.arpPing(sample.address)

    results.push({
      inventoryId: target.inventoryId,
      driver: driverCode,
      leaseCount: leases.length,
      sample: {
        mac: maskMac(sample.macAddress),
        ipPresent: true
      },
      dhcpLease: {
        status: dhcpLease.status,
        found: Boolean(dhcpLease.data),
        leaseStatus: rowValue(dhcpLease.data, 'status'),
        disabled: rowValue(dhcpLease.data, 'disabled'),
        blocked: rowValue(dhcpLease.data, 'blocked'),
        activeAddress: Boolean(rowValue(dhcpLease.data, 'active-address') || rowValue(dhcpLease.data, 'address')),
        message: dhcpLease.message
      },
      ping: {
        status: ping.status,
        replies: Array.isArray(ping.data) ? ping.data.length : ping.data ? 1 : 0,
        message: ping.message
      },
      arpPing: {
        status: arpPing.status,
        replies: Array.isArray(arpPing.data) ? arpPing.data.length : arpPing.data ? 1 : 0,
        message: arpPing.message
      }
    })
  }

  console.log(JSON.stringify(results, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

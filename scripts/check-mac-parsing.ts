import 'dotenv/config'
import { db, pool } from '../server/utils/db'
import { getDriverForEquipment } from '../server/utils/network-driver-context'

function maskMac(mac?: string | null) {
  if (!mac) return null
  const normalized = mac.toLowerCase()
  return `${normalized.slice(0, 2)}:**:**:**:${normalized.slice(-5)}`
}

function summarizeCheck(check: { name: string, status: string, data?: unknown, message?: string }) {
  return {
    name: check.name,
    status: check.status,
    dataCount: Array.isArray(check.data) ? check.data.length : check.data ? 1 : 0,
    message: check.message
  }
}

async function main() {
  const targets = await db.query.networkEquipment.findMany({
    where: (table, { inArray }) => inArray(table.inventoryId, [
      'MT-10-0-222-86',
      'MT-10-0-222-4',
      'DASAN-10-0-222-16',
      'DASAN-10-0-222-108'
    ])
  })
  const results = []

  for (const target of targets) {
    const { driver, driverCode } = await getDriverForEquipment(target.id)

    if (driverCode === 'mikrotik_v7') {
      const leases = await driver.getLeases()
      const sample = leases.find(lease => lease.macAddress && lease.address)
      const checks = sample?.macAddress
        ? [
            await driver.getDhcpLease(sample.macAddress),
            await driver.getBridgeHost(sample.macAddress),
            await driver.getSwitchFdb(sample.macAddress)
          ]
        : []

      results.push({
        inventoryId: target.inventoryId,
        driver: driverCode,
        leaseCount: leases.length,
        sample: {
          mac: maskMac(sample?.macAddress),
          ipPresent: Boolean(sample?.address)
        },
        checks: checks.map(summarizeCheck)
      })
      continue
    }

    if (driverCode === 'dasan_nos') {
      const onus = await driver.getOnus()
      const active = onus.filter(onu => onu.status.toLowerCase() === 'active').slice(0, 5)
      const perOnu = []
      let sampleMac: string | null = null

      for (const onu of active) {
        const macs = await driver.getOnuMacTable(onu.oltPort, onu.onuId)
        if (!sampleMac && macs[0]?.macAddress) sampleMac = macs[0].macAddress
        perOnu.push({
          target: `${onu.oltPort}/${onu.onuId}`,
          macCount: macs.length,
          firstMaskedMac: maskMac(macs[0]?.macAddress)
        })
      }

      const bridgeCheck = sampleMac ? await driver.getBridgeHost(sampleMac) : null
      results.push({
        inventoryId: target.inventoryId,
        driver: driverCode,
        onuCount: onus.length,
        activeSample: active.length,
        perOnu,
        bridgeMacCheck: bridgeCheck
          ? {
              sampleMac: maskMac(sampleMac),
              ...summarizeCheck(bridgeCheck)
            }
          : null
      })
    }
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

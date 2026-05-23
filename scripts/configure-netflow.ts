import 'dotenv/config'
import { diagnosticRuns } from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { getDriverForEquipment } from '../server/utils/network-driver-context'

const collector = process.argv.find(arg => arg.startsWith('--collector='))?.split('=')[1]
  || process.env.NETCOREOPS_NETFLOW_COLLECTOR
  || '10.0.222.226:2055'

async function main() {
  const inventoryIds = process.argv
    .slice(2)
    .filter(arg => !arg.startsWith('--'))
  const equipmentRows = await db.query.networkEquipment.findMany({
    with: {
      managementDriver: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })
  const selectedRows = inventoryIds.length
    ? equipmentRows.filter(row => inventoryIds.includes(row.inventoryId))
    : equipmentRows.filter(row => row.status === 'IN_USE' && (row.managementDriver?.code === 'mikrotik_v7' || row.managementProtocol === 'routeros'))
  const results = []

  for (const equipment of selectedRows) {
    const { driver, driverCode } = await getDriverForEquipment(equipment.id)
    const result = await driver.configureNetflow({ collector, version: 'ipfix' })
    const success = result.status === 'ok' || result.status === 'warning'

    await db.insert(diagnosticRuns).values({
      equipmentId: equipment.id,
      driverCode,
      runType: 'netflow-config',
      target: collector,
      success,
      result
    })

    results.push({
      inventoryId: equipment.inventoryId,
      driverCode,
      status: result.status,
      message: result.message,
      data: result.data
    })
  }

  console.log(JSON.stringify({
    ok: results.every(result => result.status === 'ok' || result.status === 'warning'),
    collector,
    equipmentCount: results.length,
    results
  }, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

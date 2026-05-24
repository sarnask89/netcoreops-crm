import 'dotenv/config'
import { db, pool } from '../server/utils/db'
import { RouterOsApiClient } from '../server/network-drivers/routeros-api-client'
import { toDriverEquipment } from '../server/utils/network-driver-context'

function asRows(value: unknown) {
  return Array.isArray(value) ? value.filter(row => row && typeof row === 'object') as Record<string, unknown>[] : []
}

async function readStatus(equipment: Parameters<typeof toDriverEquipment>[0]) {
  const driverEquipment = toDriverEquipment(equipment)
  const host = driverEquipment.managementIp || driverEquipment.hostname || ''
  const port = driverEquipment.accessProfile?.defaultPort || driverEquipment.managementPort || 8728
  const username = driverEquipment.accessProfile?.username || ''
  const password = driverEquipment.accessProfile?.passwordEncrypted || ''
  const api = new RouterOsApiClient({ host, port, username, password, timeoutMs: 12000 })

  await api.connect()
  try {
    const trafficFlow = asRows(await api.write('/ip/traffic-flow/print'))
    const targets = asRows(await api.write('/ip/traffic-flow/target/print'))
    const dhcpServers = asRows(await api.write('/ip/dhcp-server/print'))
    const routes = asRows(await api.write('/ip/route/print', ['?dst-address=0.0.0.0/0']))

    return {
      inventoryId: equipment.inventoryId,
      host,
      port,
      status: 'ok',
      trafficFlow,
      targets,
      dhcpServers,
      routes
    }
  } catch (error) {
    return {
      inventoryId: equipment.inventoryId,
      host,
      port,
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    }
  } finally {
    api.close()
  }
}

async function main() {
  const inventoryIds = process.argv
    .slice(2)
    .filter(arg => !arg.startsWith('--'))
  const equipmentRows = await db.query.networkEquipment.findMany({
    with: {
      accessProfile: true,
      managementDriver: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })
  const selectedRows = inventoryIds.length
    ? equipmentRows.filter(row => inventoryIds.includes(row.inventoryId))
    : equipmentRows.filter(row => row.status === 'IN_USE' && (row.managementDriver?.code === 'mikrotik_v7' || row.managementProtocol === 'routeros'))

  const results = []
  for (const equipment of selectedRows) {
    results.push(await readStatus(equipment as Parameters<typeof toDriverEquipment>[0]))
  }

  console.log(JSON.stringify({
    ok: results.every(result => result.status === 'ok'),
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

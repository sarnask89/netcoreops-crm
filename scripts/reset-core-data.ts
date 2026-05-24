import 'dotenv/config'
import { pool } from '../server/utils/db'

async function main() {
  const client = await pool.connect()
  try {
    await client.query('begin')

    const clearOnuEquipment = await client.query(`
      delete from network_equipment
      where onu_port is not null
         or onu_id is not null
         or bridge_mode = true
      returning id
    `)

    const clearFtthOnus = await client.query(`
      delete from ftth_onus
      returning id
    `)

    const clearCustomers = await client.query(`
      delete from customers
      returning id
    `)

    await client.query('commit')

    console.log(JSON.stringify({
      networkEquipmentRows: clearOnuEquipment.rowCount || 0,
      ftthOnuRows: clearFtthOnus.rowCount || 0,
      customerRows: clearCustomers.rowCount || 0
    }, null, 2))
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

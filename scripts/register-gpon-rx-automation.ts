import 'dotenv/config'
import { pool } from '../server/utils/db'
import { registerGponRxAutomationScript } from '../server/automation/gpon-rx-script-template'

async function main() {
  const equipmentId = process.argv.find(arg => arg.startsWith('--equipment-id='))?.split('=')[1]
  const script = await registerGponRxAutomationScript(equipmentId || null)

  console.log(JSON.stringify({
    ok: true,
    script
  }, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

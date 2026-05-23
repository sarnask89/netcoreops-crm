import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { automationScripts } from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { executeAutomationScript } from '../server/utils/automation-script-runner'

function argValue(name: string) {
  const prefix = `${name}=`
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length)
}

async function main() {
  const id = argValue('--id')
  const name = argValue('--name')
  const equipmentId = argValue('--equipment-id')

  const script = id
    ? await db.query.automationScripts.findFirst({ where: eq(automationScripts.id, Number(id)) })
    : name
      ? await db.query.automationScripts.findFirst({ where: eq(automationScripts.name, name) })
      : null

  if (!script) throw new Error('Nie znaleziono skryptu automatyzacji')
  const execution = await executeAutomationScript({
    ...script,
    equipmentId: equipmentId || script.equipmentId
  })

  if (execution.stdout) process.stdout.write(execution.stdout)
  if (execution.stderr) process.stderr.write(execution.stderr)

  if (execution.success) {
    await db.update(automationScripts)
      .set({ lastRunAt: new Date() })
      .where(eq(automationScripts.id, script.id))
  }

  process.exitCode = execution.success ? 0 : execution.exitCode || 1
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

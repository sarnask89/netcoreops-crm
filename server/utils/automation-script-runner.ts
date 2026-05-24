import { spawn } from 'node:child_process'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { AutomationScript } from '../db/schema'

export interface AutomationScriptExecution {
  success: boolean
  exitCode: number | null
  stdout: string
  stderr: string
  data: unknown
}

function parseExecutionData(stdout: string) {
  const trimmed = stdout.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function commandForScript(script: AutomationScript, tempFilePath?: string) {
  if (script.scriptLanguage === 'typescript' || script.scriptLanguage === 'tsx') {
    if (!tempFilePath) throw new Error('Brak pliku tymczasowego dla skryptu TypeScript')
    return { command: 'pnpm', args: ['exec', 'tsx', tempFilePath] }
  }

  if (script.scriptLanguage === 'bash') {
    return { command: 'bash', args: ['-lc', script.scriptBody] }
  }

  throw new Error(`Nieobsługiwany język skryptu: ${script.scriptLanguage}`)
}

export async function executeAutomationScript(script: AutomationScript): Promise<AutomationScriptExecution> {
  const cwd = process.cwd()
  const tempFilePath = script.scriptLanguage === 'typescript' || script.scriptLanguage === 'tsx'
    ? join(cwd, `.netcoreops-automation-${script.id}-${Date.now()}.ts`)
    : undefined

  if (tempFilePath) {
    await writeFile(tempFilePath, script.scriptBody, 'utf8')
  }

  const { command, args } = commandForScript(script, tempFilePath)

  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        NETCOREOPS_AUTOMATION_SCRIPT_ID: String(script.id),
        NETCOREOPS_AUTOMATION_SCRIPT_NAME: script.name,
        NETCOREOPS_AUTOMATION_EQUIPMENT_ID: script.equipmentId || ''
      },
      shell: false
    })
    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
    }, script.timeoutSeconds * 1000)

    child.stdout.on('data', chunk => stdoutChunks.push(Buffer.from(chunk)))
    child.stderr.on('data', chunk => stderrChunks.push(Buffer.from(chunk)))
    child.on('close', async (exitCode) => {
      clearTimeout(timeout)
      if (tempFilePath) await rm(tempFilePath, { force: true }).catch(() => undefined)

      const stdout = Buffer.concat(stdoutChunks).toString('utf8')
      const stderr = Buffer.concat(stderrChunks).toString('utf8')
      resolve({
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        data: parseExecutionData(stdout)
      })
    })
  })
}

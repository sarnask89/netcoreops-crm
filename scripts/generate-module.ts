import { resolve } from 'node:path'
import { formatGeneratedFileList, generateModuleFiles, writeGeneratedFiles } from './codegen/module-generator'

function readArgs(argv: string[]) {
  const args = new Set(argv.slice(3))
  const definitionPath = argv[2]
  if (!definitionPath || definitionPath === '--help' || definitionPath === '-h') {
    console.log(`Uzycie:
  rtk pnpm tsx scripts/generate-module.ts <definition.json> [--dry-run] [--force]

JSON tworzy migracje SQL, Drizzle table, Zod schema, endpointy CRUD i strone Vue.
`)
    process.exit(definitionPath ? 0 : 1)
  }
  return {
    definitionPath: resolve(definitionPath),
    dryRun: args.has('--dry-run'),
    force: args.has('--force')
  }
}

const options = readArgs(process.argv)
const rootDir = process.cwd()
const files = await generateModuleFiles({ rootDir, ...options })

console.log(formatGeneratedFileList(files))
await writeGeneratedFiles(files, options)
console.log(options.dryRun ? 'Tryb dry-run: nie zapisano plikow.' : 'Wygenerowano pliki modulu.')

import { resolve } from 'node:path'
import {
  formatGeneratedFileList,
  generateModulePlan,
  writeGeneratedFiles
} from './codegen/module-generator'

function usage(exitCode: number): never {
  console.log(`Uzycie:
  rtk pnpm tsx scripts/generate-module.ts <definition.json|definition.xml> [--dry-run] [--validate-only] [--force]
  rtk pnpm tsx scripts/generate-module.ts --input a.json --input b.xml [--dry-run] [--validate-only] [--force]

JSON/XML tworzy migracje SQL, Drizzle table, Zod schema, endpointy CRUD i strone Vue.

Opcje:
  --input <path>       Dodaje plik definicji. Mozna podac wiele razy.
  --dry-run           Pokazuje plan bez zapisu plikow.
  --validate-only     Uruchamia walidacje planu bez zapisu plikow.
  --force             Pozwala nadpisac istniejace wygenerowane pliki.
  --repair-with-ollama Rozpoznany przelacznik dla lokalnej petli naprawczej Ollama.
`)
  process.exit(exitCode)
}

function readArgs(argv: string[]) {
  const definitionPaths: string[] = []
  let dryRun = false
  let force = false
  let validateOnly = false
  let repairWithOllama = false

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') usage(0)
    else if (arg === '--dry-run') dryRun = true
    else if (arg === '--force') force = true
    else if (arg === '--validate-only') validateOnly = true
    else if (arg === '--repair-with-ollama') repairWithOllama = true
    else if (arg === '--input') {
      const value = argv[index + 1]
      if (!value) usage(1)
      definitionPaths.push(resolve(value))
      index += 1
    } else if (arg.startsWith('--input=')) {
      definitionPaths.push(resolve(arg.slice('--input='.length)))
    } else if (arg.startsWith('-')) {
      throw new Error(`Nieznana opcja: ${arg}`)
    } else {
      definitionPaths.push(resolve(arg))
    }
  }

  if (definitionPaths.length === 0) usage(1)

  return {
    definitionPaths,
    dryRun,
    force,
    validateOnly,
    repairWithOllama
  }
}

const options = readArgs(process.argv)
const rootDir = process.cwd()

if (options.repairWithOllama) {
  console.log('Ollama repair loop: przelacznik rozpoznany. W v1 generator waliduje plan deterministycznie; petla naprawcza uzyje modelu netcoreops-module-coder po dodaniu endpointu repair.')
}

const plan = await generateModulePlan({
  rootDir,
  definitionPaths: options.definitionPaths,
  force: options.force
})

console.log(formatGeneratedFileList(plan.files))

if (!plan.validation.success) {
  console.error('\nWalidacja generatora nie powiodla sie:')
  for (const error of plan.validation.errors) console.error(`- ${error}`)
  process.exit(1)
}

if (plan.validation.warnings.length) {
  console.warn('\nOstrzezenia generatora:')
  for (const warning of plan.validation.warnings) console.warn(`- ${warning}`)
}

if (options.dryRun || options.validateOnly) {
  console.log(options.validateOnly ? 'Tryb validate-only: nie zapisano plikow.' : 'Tryb dry-run: nie zapisano plikow.')
} else {
  await writeGeneratedFiles(plan.files, options)
  console.log('Wygenerowano pliki modulu.')
}

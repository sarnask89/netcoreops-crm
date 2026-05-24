#!/usr/bin/env tsx

import {
  generateModulePlan,
  writeGeneratedFiles
} from './codegen/module-generator'

interface CliOptions {
  inputs: string[]
  dryRun: boolean
  validateOnly: boolean
  force: boolean
  repairWithOllama: boolean
}

function usage(): string {
  return [
    'Uzycie:',
    '  rtk pnpm tsx scripts/generate-module.ts <definition.json>',
    '  rtk pnpm tsx scripts/generate-module.ts --input a.json --input b.xml',
    '',
    'Opcje:',
    '  --input <path>          Definicja JSON/XML. Mozna powtorzyc.',
    '  --dry-run              Pokaz plan bez zapisu.',
    '  --validate-only        Tylko walidacja, bez zapisu.',
    '  --force                Nadpisz istniejace pliki.',
    '  --repair-with-ollama   Rozpoznane w v1. Repair loop jest dostepny przez osobny endpoint/skeleton.'
  ].join('\n')
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    inputs: [],
    dryRun: false,
    validateOnly: false,
    force: false,
    repairWithOllama: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--input') {
      const value = argv[index + 1]

      if (!value) {
        throw new Error('Brak wartosci dla --input')
      }

      options.inputs.push(value)
      index += 1
      continue
    }

    if (arg.startsWith('--input=')) {
      options.inputs.push(arg.slice('--input='.length))
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--validate-only') {
      options.validateOnly = true
      continue
    }

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg === '--repair-with-ollama') {
      options.repairWithOllama = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      console.log(usage())
      process.exit(0)
    }

    if (arg.startsWith('-')) {
      throw new Error(`Nieznana opcja: ${arg}`)
    }

    options.inputs.push(arg)
  }

  return options
}

function printValidationErrors(errors: string[]): void {
  if (errors.length === 0) {
    return
  }

  console.error('Bledy walidacji:')

  for (const error of errors) {
    console.error(`  - ${error}`)
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  if (options.inputs.length === 0) {
    console.error(usage())
    process.exit(1)
  }

  if (options.repairWithOllama) {
    console.warn('Opcja --repair-with-ollama zostala rozpoznana. W v1 repair loop jest dostepny przez osobny endpoint/skeleton.')
  }

  const plan = await generateModulePlan({
    rootDir: process.cwd(),
    definitionPaths: options.inputs,
    force: options.force
  })

  console.log(`Moduly: ${plan.modules.length}`)
  console.log(`Pliki w planie: ${plan.files.length}`)
  console.log(`Walidacja: ${plan.validation.success ? 'OK' : 'FAIL'}`)

  if (plan.validation.warnings.length > 0) {
    console.warn('Ostrzezenia:')

    for (const warning of plan.validation.warnings) {
      console.warn(`  - ${warning}`)
    }
  }

  if (!plan.validation.success) {
    printValidationErrors(plan.validation.errors)
    process.exit(1)
  }

  if (options.validateOnly) {
    console.log('Validate-only: zakonczono bez zapisu.')
    return
  }

  if (options.dryRun) {
    console.log('Dry-run: zakonczono bez zapisu.')
    console.log('Planowane pliki:')

    for (const file of plan.files) {
      console.log(`  - ${file.path}${file.kind ? ` [${file.kind}]` : ''}`)
    }

    return
  }

  await writeGeneratedFiles(plan.files, {
    force: options.force
  })

  console.log('Zapisano pliki:')

  for (const file of plan.files) {
    console.log(`  - ${file.path}`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

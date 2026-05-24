#!/usr/bin/env tsx

import { pathToFileURL } from 'node:url'
import {
  generateModulePlan,
  writeGeneratedFiles
} from './codegen/module-generator'

export interface CliOptions {
  inputs: string[]
  dryRun: boolean
  validateOnly: boolean
  force: boolean
  repairWithOllama: boolean
  json: boolean
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
    '  --json                 Wypisz wynik jako JSON.',
    '  --force                Nadpisz istniejace pliki.',
    '  --repair-with-ollama   Rozpoznane w v1. Repair loop jest dostepny przez osobny endpoint/skeleton.'
  ].join('\n')
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    inputs: [],
    dryRun: false,
    validateOnly: false,
    force: false,
    repairWithOllama: false,
    json: false
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

    if (arg === '--json') {
      options.json = true
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

function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2))
}

export async function runGenerateModuleCli(argv = process.argv.slice(2), rootDir = process.cwd()): Promise<number> {
  const options = parseArgs(argv)

  if (options.inputs.length === 0) {
    if (options.json) {
      printJson({
        success: false,
        error: 'Brak plikow definicji'
      })

      return 1
    }

    console.error(usage())
    return 1
  }

  if (options.repairWithOllama && !options.json) {
    console.warn('Opcja --repair-with-ollama zostala rozpoznana. W v1 repair loop jest dostepny przez osobny endpoint/skeleton.')
  }

  let plan

  try {
    plan = await generateModulePlan({
      rootDir,
      definitionPaths: options.inputs,
      force: options.force
    })
  } catch (error) {
    if (options.json) {
      printJson({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })

      return 1
    }

    throw error
  }

  if (options.json) {
    if (options.validateOnly) {
      printJson({
        success: plan.validation.success,
        data: plan.validation
      })

      return plan.validation.success ? 0 : 1
    }

    if (options.dryRun) {
      printJson({
        success: plan.validation.success,
        data: plan
      })

      return plan.validation.success ? 0 : 1
    }
  }

  if (!options.json) {
    console.log(`Moduly: ${plan.modules.length}`)
    console.log(`Pliki w planie: ${plan.files.length}`)
    console.log(`Walidacja: ${plan.validation.success ? 'OK' : 'FAIL'}`)

    if (plan.validation.warnings.length > 0) {
      console.warn('Ostrzezenia:')

      for (const warning of plan.validation.warnings) {
        console.warn(`  - ${warning}`)
      }
    }
  }

  if (!plan.validation.success) {
    if (!options.json) {
      printValidationErrors(plan.validation.errors)
    }

    return 1
  }

  if (options.validateOnly) {
    if (!options.json) {
      console.log('Validate-only: zakonczono bez zapisu.')
    }

    return 0
  }

  if (options.dryRun) {
    if (!options.json) {
      console.log('Dry-run: zakonczono bez zapisu.')
      console.log('Planowane pliki:')

      for (const file of plan.files) {
        console.log(`  - ${file.path}${file.kind ? ` [${file.kind}]` : ''}`)
      }
    }

    return 0
  }

  await writeGeneratedFiles(plan.files, {
    force: options.force
  })

  if (options.json) {
    printJson({
      success: true,
      data: {
        files: plan.files.map(file => file.path)
      }
    })

    return 0
  }

  console.log('Zapisano pliki:')

  for (const file of plan.files) {
    console.log(`  - ${file.path}`)
  }

  return 0
}

function isCliEntry(): boolean {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
}

if (isCliEntry()) {
  runGenerateModuleCli().then((code) => {
    process.exitCode = code
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

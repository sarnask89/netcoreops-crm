import type { DriverCheckResult } from '../network-drivers/types'

export interface DiagnosticPresentationRow {
  name: string
  status: DriverCheckResult['status']
  summary: string
  recommendation: string
  details: unknown
}

export interface DiagnosticPresentation {
  status: 'ok' | 'warning' | 'error' | 'unsupported'
  title: string
  target: string
  recommendation: string
  rows: DiagnosticPresentationRow[]
  raw: unknown
}

function summarizeCheck(check: DriverCheckResult) {
  if (check.message) return check.message
  if (Array.isArray(check.data)) return check.data.length ? `${check.data.length} znalezionych wpisów` : 'Brak wpisów'
  if (check.data && typeof check.data === 'object') return 'Odpowiedź zawiera dane'
  return check.status === 'ok' ? 'Operacja zakończona poprawnie' : 'Brak danych'
}

function recommendationFor(check: DriverCheckResult) {
  if (check.status === 'ok') return 'Nie wymaga działania'
  if (check.status === 'unsupported') return 'Ten driver nie obsługuje tej operacji'
  if (check.status === 'warning') return 'Sprawdź konfigurację urządzenia i dane wejściowe'
  return 'Sprawdź dostęp do urządzenia, poświadczenia i parametry testu'
}

function overallRecommendation(rows: DiagnosticPresentationRow[]) {
  if (!rows.length) return 'Uruchom test lub wybierz dane wejściowe'
  const actionable = rows.find(row => row.status !== 'ok')
  return actionable?.recommendation || 'Nie wymaga działania'
}

export function presentDiagnostics(input: {
  title: string
  target?: string | Record<string, unknown> | null
  checks: DriverCheckResult[]
  raw?: unknown
}): DiagnosticPresentation {
  const statuses = input.checks.map(check => check.status)
  const status = statuses.includes('ok')
    ? 'ok'
    : statuses.includes('warning')
      ? 'warning'
      : statuses.includes('error')
        ? 'error'
        : 'unsupported'

  const rows = input.checks.map(check => ({
    name: check.name,
    status: check.status,
    summary: summarizeCheck(check),
    recommendation: recommendationFor(check),
    details: check.data ?? check.message ?? null
  }))

  return {
    status,
    title: input.title,
    target: typeof input.target === 'string'
      ? input.target
      : input.target
        ? Object.values(input.target).filter(Boolean).join(' / ')
        : 'Brak celu',
    recommendation: overallRecommendation(rows),
    rows,
    raw: input.raw ?? input.checks
  }
}

export function withDiagnosticPresentation<T extends { target?: string | Record<string, unknown> | null, checks?: DriverCheckResult[], commandTree?: DriverCheckResult }>(
  title: string,
  data: T
): T & { presentation: DiagnosticPresentation } {
  const checks = data.checks?.length ? data.checks : data.commandTree ? [data.commandTree] : []
  return {
    ...data,
    presentation: presentDiagnostics({
      title,
      target: data.target,
      checks,
      raw: data
    })
  }
}

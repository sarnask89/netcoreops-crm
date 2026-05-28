export type SystemConsoleEventType = 'database' | 'error'

export interface SystemConsoleEvent {
  id: string
  type: SystemConsoleEventType
  severity: 'info' | 'error'
  message: string
  detail?: string
  createdAt: string
}

const maxEvents = 300
const events: SystemConsoleEvent[] = []

function pushConsoleEvent(event: Omit<SystemConsoleEvent, 'id' | 'createdAt'>) {
  events.unshift({
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  })

  if (events.length > maxEvents) events.length = maxEvents
}

export function recordDatabaseChange(statement: string) {
  pushConsoleEvent({
    type: 'database',
    severity: 'info',
    message: 'Zmiana w bazie danych',
    detail: statement.replace(/\s+/g, ' ').trim().slice(0, 1000)
  })
}

export function recordSystemError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : String(error)
  pushConsoleEvent({
    type: 'error',
    severity: 'error',
    message: context ? `${context}: ${message}` : message,
    detail: error instanceof Error ? error.stack : undefined
  })
}

export function listConsoleEvents(limit = 100) {
  return events.slice(0, limit)
}

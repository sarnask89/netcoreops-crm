import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as relations from '../db/relations'
import * as schema from '../db/schema'
import { recordDatabaseChange, recordSystemError } from './system-console'

const connectionString = process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_URL_NON_POOLING
  || process.env.pgdb_DATABASE_URL
  || process.env.pgdb_POSTGRES_URL
  || process.env.pgdb_POSTGRES_URL_NON_POOLING
const isVercelRuntime = Boolean(process.env.VERCEL)

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database-backed API routes will fail until it is configured.')
}

export const pool = new Pool({
  connectionString,
  max: isVercelRuntime ? 1 : 20,
  min: isVercelRuntime ? 0 : 5,
  // Timeout waiting for a connection from the pool
  connectionTimeoutMillis: 2000,
  // Timeout for idle connections before closing
  idleTimeoutMillis: 30000
})

const changeStatementPattern = /^\s*(insert|update|delete|alter|create|drop|truncate)\b/i
type QueryFunction = (...args: unknown[]) => unknown
const originalQuery = pool.query.bind(pool) as QueryFunction

pool.query = ((...args: unknown[]) => {
  const queryConfig = args[0]
  const statement = typeof args[0] === 'string'
    ? args[0]
    : queryConfig && typeof queryConfig === 'object' && 'text' in queryConfig && typeof (queryConfig as Record<string, unknown>).text === 'string'
      ? String((queryConfig as Record<string, unknown>).text)
      : undefined

  const result = originalQuery(...args)

  if (result && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
    return result
      .then((value: unknown) => {
        if (statement && changeStatementPattern.test(statement)) recordDatabaseChange(statement)
        return value
      })
      .catch((error: unknown) => {
        recordSystemError(error, 'Database query')
        throw error
      })
  }

  if (statement && changeStatementPattern.test(statement)) recordDatabaseChange(statement)
  return result
}) as Pool['query']

pool.on('error', (error) => {
  recordSystemError(error, 'Database pool')
})

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations
  }
})

export type DbClient = typeof db

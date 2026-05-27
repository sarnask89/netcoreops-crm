import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as relations from '../db/relations'
import * as schema from '../db/schema'

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

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations
  }
})

export type DbClient = typeof db

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as relations from '../db/relations'
import * as schema from '../db/schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database-backed API routes will fail until it is configured.')
}

export const pool = new Pool({
  connectionString
})

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations
  }
})

export type DbClient = typeof db

import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public'
  },
  strict: true,
  verbose: true
})

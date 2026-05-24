import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Client } from 'pg'

const apply = process.argv.includes('--apply')
const hardDelete = process.argv.includes('--hard-delete')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const client = new Client({ connectionString })

const candidateSql = `
  from customers c
  where c.archived_at is null
    and not exists (select 1 from customer_devices d where d.customer_id = c.id)
    and not exists (select 1 from subscriptions s where s.customer_id = c.id)
    and not exists (select 1 from customer_services cs where cs.customer_id = c.id)
`

await client.connect()

try {
  const candidates = await client.query<{
    id: string
    full_name: string
    import_external_id: string | null
    created_at: string
  }>(`
    select c.id, c.full_name, c.import_external_id, c.created_at
    ${candidateSql}
    order by c.created_at desc, c.id
  `)

  await mkdir('scripts/.cleanup-backups', { recursive: true })
  const backupPath = join('scripts/.cleanup-backups', `orphan-customers-${new Date().toISOString().replaceAll(':', '-')}.json`)
  await writeFile(backupPath, JSON.stringify(candidates.rows, null, 2))

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      candidates: candidates.rowCount,
      backupPath,
      sample: candidates.rows.slice(0, 20)
    }, null, 2))
  } else if (hardDelete) {
    await client.query('begin')
    const deleted = await client.query<{ id: string }>(`
      delete from customers c
      where c.id in (
        select c.id
        ${candidateSql}
      )
      returning c.id
    `)
    await client.query('commit')

    console.log(JSON.stringify({
      mode: 'apply',
      operation: 'hard-delete',
      deleted: deleted.rowCount,
      backupPath
    }, null, 2))
  } else {
    await client.query('begin')
    const archived = await client.query<{ id: string }>(`
      update customers c
      set archived_at = now(),
          archive_reason = 'Czyszczenie osieroconych klientów po konflikcie importu DHCP'
      where c.id in (
        select c.id
        ${candidateSql}
      )
      returning c.id
    `)
    await client.query('commit')

    console.log(JSON.stringify({
      mode: 'apply',
      operation: 'archive',
      archived: archived.rowCount,
      backupPath
    }, null, 2))
  }
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  throw error
} finally {
  await client.end()
}

import 'dotenv/config'
import type { Pool, PoolClient } from 'pg'
import { pool } from '../server/utils/db'

type Mode = 'preview' | 'apply'

interface CleanupSummary {
  duplicateCustomerGroups: number
  duplicateCustomers: number
  redundantCustomers: number
  relinkedCustomerDevices: number
  relinkedCustomerServices: number
  relinkedSubscriptions: number
  archivedCustomers: number
  renamedDeviceHostnames: number
  clearedDuplicateDeviceIps: number
  duplicateDeviceHostnames: number
  duplicateDeviceIps: number
  duplicateDeviceMacs: number
}

function modeFromArgs(): Mode {
  return process.argv.includes('--apply') ? 'apply' : 'preview'
}

async function countDuplicateDevices(client: Pool | PoolClient = pool) {
  const { rows } = await client.query<{
    duplicate_hostnames: string
    duplicate_ips: string
    duplicate_macs: string
  }>(`
    select
      (
        select count(*) from (
          select lower(hostname)
          from customer_devices
          where archived_at is null and hostname is not null
          group by lower(hostname)
          having count(*) > 1
        ) rows
      ) as duplicate_hostnames,
      (
        select count(*) from (
          select ip_address
          from customer_devices
          where archived_at is null and ip_address is not null
          group by ip_address
          having count(*) > 1
        ) rows
      ) as duplicate_ips,
      (
        select count(*) from (
          select mac_address
          from customer_devices
          where archived_at is null and mac_address is not null
          group by mac_address
          having count(*) > 1
        ) rows
      ) as duplicate_macs
  `)

  return {
    duplicateDeviceHostnames: Number(rows[0]?.duplicate_hostnames || 0),
    duplicateDeviceIps: Number(rows[0]?.duplicate_ips || 0),
    duplicateDeviceMacs: Number(rows[0]?.duplicate_macs || 0)
  }
}

async function cleanupCustomers(mode: Mode): Promise<CleanupSummary> {
  const client = await pool.connect()
  try {
    await client.query('begin')

    await client.query(`
      create temporary table crm_duplicate_customer_map on commit drop as
      with customer_usage as (
        select
          c.id,
          lower(trim(c.full_name)) as duplicate_key,
          c.created_at,
          count(distinct cd.id) as devices,
          count(distinct cs.id) as services,
          count(distinct s.id) as subscriptions
        from customers c
        left join customer_devices cd on cd.customer_id = c.id
        left join customer_services cs on cs.customer_id = c.id
        left join subscriptions s on s.customer_id = c.id
        where c.archived_at is null
        group by c.id
      ),
      ranked as (
        select
          *,
          first_value(id) over (
            partition by duplicate_key
            order by (devices + services + subscriptions) desc, created_at asc, id asc
          ) as keep_customer_id,
          count(*) over (partition by duplicate_key) as duplicate_count
        from customer_usage
      )
      select id as duplicate_customer_id, keep_customer_id, duplicate_key, duplicate_count
      from ranked
      where duplicate_count > 1 and id <> keep_customer_id
    `)

    const stats = await client.query<{
      duplicate_customer_groups: string
      duplicate_customers: string
      redundant_customers: string
    }>(`
      select
        count(*) as duplicate_customer_groups,
        coalesce(sum(duplicate_count), 0) as duplicate_customers,
        coalesce(sum(duplicate_count - 1), 0) as redundant_customers
      from (
        select duplicate_key, max(duplicate_count) as duplicate_count
        from crm_duplicate_customer_map
        group by duplicate_key
      ) groups
    `)

    let relinkedCustomerDevices = 0
    let relinkedCustomerServices = 0
    let relinkedSubscriptions = 0
    let archivedCustomers = 0
    let renamedDeviceHostnames = 0
    let clearedDuplicateDeviceIps = 0

    if (mode === 'apply') {
      const relinkDevices = await client.query(`
        update customer_devices cd
        set customer_id = map.keep_customer_id
        from crm_duplicate_customer_map map
        where cd.customer_id = map.duplicate_customer_id
      `)
      relinkedCustomerDevices = relinkDevices.rowCount || 0

      const relinkServices = await client.query(`
        update customer_services cs
        set customer_id = map.keep_customer_id
        from crm_duplicate_customer_map map
        where cs.customer_id = map.duplicate_customer_id
      `)
      relinkedCustomerServices = relinkServices.rowCount || 0

      const relinkSubs = await client.query(`
        update subscriptions s
        set customer_id = map.keep_customer_id
        from crm_duplicate_customer_map map
        where s.customer_id = map.duplicate_customer_id
      `)
      relinkedSubscriptions = relinkSubs.rowCount || 0

      const archive = await client.query(`
        update customers c
        set
          archived_at = now(),
          archive_reason = 'Automatyczna archiwizacja duplikatu CRM; rekord scalony z ' || map.keep_customer_id::text
        from crm_duplicate_customer_map map
        where c.id = map.duplicate_customer_id
          and c.archived_at is null
      `)
      archivedCustomers = archive.rowCount || 0

      const renameHostnames = await client.query(`
        with ranked as (
          select
            id,
            hostname,
            row_number() over (
              partition by lower(hostname)
              order by
                case when mac_address is not null then 0 else 1 end,
                created_at asc,
                id asc
            ) as rn,
            count(*) over (partition by lower(hostname)) as cnt,
            lower(
              coalesce(
                right(replace(mac_address, ':', ''), 12),
                right(replace(ip_address, '.', ''), 12),
                replace(id::text, '-', '')
              )
            ) as suffix
          from customer_devices
          where archived_at is null
        )
        update customer_devices cd
        set hostname = left(ranked.hostname, 230) || '-' || ranked.suffix
        from ranked
        where cd.id = ranked.id
          and ranked.cnt > 1
          and ranked.rn > 1
      `)
      renamedDeviceHostnames = renameHostnames.rowCount || 0

      const clearInvalidIps = await client.query(`
        update customer_devices
        set
          ip_address = null,
          import_issues = coalesce(import_issues, '[]'::jsonb) || jsonb_build_array('Usunięto niepoprawny adres IP: ' || ip_address)
        where archived_at is null
          and ip_address is not null
          and ip_address !~ '^([0-9]{1,3}\\.){3}[0-9]{1,3}$'
      `)

      const clearDuplicateIps = await client.query(`
        with ranked as (
          select
            id,
            ip_address,
            row_number() over (
              partition by ip_address
              order by
                case when mac_address is not null then 0 else 1 end,
                created_at asc,
                id asc
            ) as rn,
            count(*) over (partition by ip_address) as cnt
          from customer_devices
          where archived_at is null
            and ip_address is not null
        )
        update customer_devices cd
        set
          ip_address = null,
          import_issues = coalesce(cd.import_issues, '[]'::jsonb) || jsonb_build_array('Usunięto zduplikowany adres IP: ' || ranked.ip_address)
        from ranked
        where cd.id = ranked.id
          and ranked.cnt > 1
          and ranked.rn > 1
      `)
      clearedDuplicateDeviceIps = (clearInvalidIps.rowCount || 0) + (clearDuplicateIps.rowCount || 0)
    }

    const devices = await countDuplicateDevices(client)
    const row = stats.rows[0]
    const summary = {
      duplicateCustomerGroups: Number(row?.duplicate_customer_groups || 0),
      duplicateCustomers: Number(row?.duplicate_customers || 0),
      redundantCustomers: Number(row?.redundant_customers || 0),
      relinkedCustomerDevices,
      relinkedCustomerServices,
      relinkedSubscriptions,
      archivedCustomers,
      renamedDeviceHostnames,
      clearedDuplicateDeviceIps,
      ...devices
    }

    if (mode === 'apply') await client.query('commit')
    else await client.query('rollback')

    return summary
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  const mode = modeFromArgs()
  const summary = await cleanupCustomers(mode)
  console.log(JSON.stringify({ mode, ...summary }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })

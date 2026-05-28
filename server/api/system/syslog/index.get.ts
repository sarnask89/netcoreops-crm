import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { syslogEntries } from '../../../db/schema'
import { desc, eq } from 'drizzle-orm'

export default apiHandler(async (event) => {
  const { hostname, severity, limit: limitParam } = getQuery(event)
  const limit = Number(limitParam) || 200

  let query = db.select().from(syslogEntries).orderBy(desc(syslogEntries.receivedAt)).limit(Math.min(limit, 1000))

  if (hostname && typeof hostname === 'string') {
    query = (db.select().from(syslogEntries)
      .where(eq(syslogEntries.hostname, hostname))
      .orderBy(desc(syslogEntries.receivedAt))
      .limit(Math.min(limit, 1000))) as any
  }

  if (severity !== undefined && severity !== null) {
    const sev = Number(severity)
    if (!isNaN(sev)) {
      query = (db.select().from(syslogEntries)
        .where(eq(syslogEntries.severity, sev))
        .orderBy(desc(syslogEntries.receivedAt))
        .limit(Math.min(limit, 1000))) as any
    }
  }

  const rows = await query
  return { success: true, data: rows }
})

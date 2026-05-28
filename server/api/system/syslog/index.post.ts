import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { syslogEntries } from '../../../db/schema'
import { z } from 'zod'

const syslogSchema = z.object({
  facility: z.number().int().min(0).max(23).optional().nullable(),
  severity: z.number().int().min(0).max(7).optional().nullable(),
  timestamp: z.string().optional().nullable(),
  hostname: z.string().max(255).optional().nullable(),
  appName: z.string().max(128).optional().nullable(),
  procId: z.string().max(128).optional().nullable(),
  msgId: z.string().max(128).optional().nullable(),
  message: z.string().min(1),
  structuredData: z.any().optional().nullable(),
  raw: z.string().optional().nullable()
})

export default apiHandler(async (event) => {
  const body = syslogSchema.parse(await readBody(event))
  const timestamp = body.timestamp ? new Date(body.timestamp) : null

  const [row] = await db.insert(syslogEntries).values({
    facility: body.facility ?? null,
    severity: body.severity ?? null,
    timestamp,
    hostname: body.hostname || null,
    appName: body.appName || null,
    procId: body.procId || null,
    msgId: body.msgId || null,
    message: body.message,
    structuredData: body.structuredData || null,
    raw: body.raw || null
  }).returning()

  return { success: true, data: { id: row?.id } }
})

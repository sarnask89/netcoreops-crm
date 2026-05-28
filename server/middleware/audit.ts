import { auditLogs } from '../db/schema'
import { db } from '../utils/db'

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const excludedPaths = [
  '/api/auth/',
  '/api/portal/',
  '/api/search',
  '/api/system/options',
  '/api/system/audit-log',
  '/api/system/backups',
  '/api/diagnostics/'
]

export default defineEventHandler(async (event) => {
  const path = event.path || event.node.req.url || ''
  if (!path.startsWith('/api/') || !mutatingMethods.has(event.method)) return
  if (excludedPaths.some(p => path.startsWith(p))) return

  const session = event.context.session
  const username = session?.displayName || session?.username || 'system'
  const userId = session?.userId

  const pathStr = path.replace('/api/', '').split('?')[0]
  const segments = pathStr ? pathStr.split('/').filter(Boolean) : []
  const entity = segments[0] || 'unknown'
  const lastSegment = segments.length > 1 ? segments[segments.length - 1] : null
  const entityId = lastSegment !== segments[0] ? lastSegment : null

  db.insert(auditLogs).values({
    userId: userId || null,
    username,
    action: event.method,
    entity: `${event.method} ${entity}`,
    entityId,
    changes: null,
    ip: getRequestIP(event, { xForwardedFor: true }) || null,
    userAgent: getRequestHeader(event, 'user-agent') || null
  }).catch(() => {})
})

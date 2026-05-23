import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customerDevices } from '../../../db/schema'
import { archiveSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia klienta' })

  const payload = archiveSchema.parse(await readBody(event).catch(() => ({})))
  const [device] = await db.update(customerDevices)
    .set({
      status: 'INACTIVE',
      archivedAt: new Date(),
      archiveReason: payload.archiveReason || 'Archiwizacja z CRM'
    })
    .where(eq(customerDevices.id, id))
    .returning()

  if (!device) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })
  return { success: true, data: device }
})

import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customerServices } from '../../../db/schema'
import { archiveSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id uslugi' })

  const payload = archiveSchema.parse(await readBody(event).catch(() => ({})))
  const [service] = await db.update(customerServices)
    .set({
      status: 'TERMINATED',
      archivedAt: new Date(),
      archiveReason: payload.archiveReason || 'Archiwizacja z CRM'
    })
    .where(eq(customerServices.id, id))
    .returning()

  if (!service) throw createError({ statusCode: 404, statusMessage: 'Usluga nie istnieje' })
  return { success: true, data: service }
})

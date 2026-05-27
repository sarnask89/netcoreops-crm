import { apiHandler } from '../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customers } from '../../../db/schema'
import { archiveSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id klienta' })

  const payload = archiveSchema.parse(await readBody(event).catch(() => ({})))
  const [customer] = await db.update(customers)
    .set({
      archivedAt: new Date(),
      archiveReason: payload.archiveReason || 'Archiwizacja z CRM'
    })
    .where(eq(customers.id, id))
    .returning()

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Klient nie istnieje' })
  return { success: true, data: customer }
})

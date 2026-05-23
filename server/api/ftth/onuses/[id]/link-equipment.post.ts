import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { ftthOnus } from '../../../../db/schema'
import { db } from '../../../../utils/db'

const bodySchema = z.object({
  networkEquipmentId: z.string().uuid().nullable()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id ONU' })

  const { networkEquipmentId } = bodySchema.parse(await readBody(event))
  const [onu] = await db.update(ftthOnus)
    .set({ networkEquipmentId })
    .where(eq(ftthOnus.id, id))
    .returning()

  if (!onu) throw createError({ statusCode: 404, statusMessage: 'ONU nie istnieje' })

  return { success: true, data: onu }
})

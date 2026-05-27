import { apiHandler } from '../../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { customerDevices } from '../../../../db/schema'
import { db } from '../../../../utils/db'

const bodySchema = z.object({
  customerDeviceId: z.string().uuid().nullable()
})

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id ONU' })

  const { customerDeviceId } = bodySchema.parse(await readBody(event))
  const onu = await db.query.ftthOnus.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: { ponPort: true }
  })

  if (!onu) throw createError({ statusCode: 404, statusMessage: 'ONU nie istnieje' })

  if (!customerDeviceId) {
    await db.update(customerDevices)
      .set({ ftthOnuId: null })
      .where(eq(customerDevices.ftthOnuId, id))
    return { success: true, data: { ftthOnuId: id, customerDeviceId: null } }
  }

  const [device] = await db.update(customerDevices)
    .set({
      ftthOnuId: id,
      oltPort: onu.ponPort.portCode,
      onuId: onu.onuIdentifier
    })
    .where(eq(customerDevices.id, customerDeviceId))
    .returning()

  if (!device) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })

  return { success: true, data: device }
})

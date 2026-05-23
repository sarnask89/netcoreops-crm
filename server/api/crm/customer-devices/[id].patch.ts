import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { customerDevices } from '../../../db/schema'
import { updateCustomerDeviceSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id urządzenia klienta' })

  const payload = updateCustomerDeviceSchema.parse(await readBody(event))
  const updateData = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
  const [device] = await db.update(customerDevices)
    .set(updateData)
    .where(eq(customerDevices.id, id))
    .returning()

  if (!device) throw createError({ statusCode: 404, statusMessage: 'Urządzenie klienta nie istnieje' })
  return { success: true, data: device }
})

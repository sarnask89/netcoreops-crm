import { readBody } from 'h3'
import { customerDevices } from '../../../db/schema'
import { createCustomerDeviceSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createCustomerDeviceSchema.parse(body)
  const [device] = await db.insert(customerDevices).values(payload).returning()

  return { success: true, data: device }
})

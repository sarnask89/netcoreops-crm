import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { accessProfileDeviceBindings } from '../../../db/schema'
import { createAccessProfileBindingSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createAccessProfileBindingSchema.parse(body)
  const [binding] = await db.insert(accessProfileDeviceBindings).values(payload).returning()

  return { success: true, data: binding }
})

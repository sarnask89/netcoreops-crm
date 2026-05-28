import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { numberPlans } from '../../../db/schema'
import { createNumberPlanSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createNumberPlanSchema.parse(body)

  const [plan] = await db.insert(numberPlans).values(payload).returning()

  return { success: true, data: plan }
})

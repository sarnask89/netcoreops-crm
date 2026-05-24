import { readBody } from 'h3'
import { tariffs } from '../../../db/schema'
import { createTariffSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = createTariffSchema.parse(body)
  const [tariff] = await db.insert(tariffs).values({
    ...payload,
    defaultNetPrice: String(payload.defaultNetPrice),
    vatRate: String(payload.vatRate)
  }).returning()

  return { success: true, data: tariff }
})

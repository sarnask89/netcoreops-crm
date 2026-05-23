import { eq } from 'drizzle-orm'
import { getRouterParam, readBody } from 'h3'
import { tariffs } from '../../../db/schema'
import { updateTariffSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function definedEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Brak id taryfy' })

  const payload = updateTariffSchema.parse(await readBody(event))
  const updateData = {
    ...payload,
    defaultNetPrice: payload.defaultNetPrice === undefined ? undefined : String(payload.defaultNetPrice),
    vatRate: payload.vatRate === undefined ? undefined : String(payload.vatRate)
  }
  const [tariff] = await db.update(tariffs)
    .set(definedEntries(updateData))
    .where(eq(tariffs.id, id))
    .returning()

  if (!tariff) throw createError({ statusCode: 404, statusMessage: 'Taryfa nie istnieje' })
  return { success: true, data: tariff }
})

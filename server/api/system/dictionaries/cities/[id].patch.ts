import { eq } from 'drizzle-orm'
import { createError, getRouterParam, readBody } from 'h3'
import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { operatorCities } from '../../../../db/schema'

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator miasta'
    })
  }

  const body = await readBody<{ name?: string, isActive?: boolean }>(event)
  const updates: Partial<typeof operatorCities.$inferInsert> = {}

  if (typeof body?.name === 'string') {
    const name = body.name.trim()
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nazwa miasta jest wymagana'
      })
    }
    updates.name = name
  }

  if (typeof body?.isActive === 'boolean') {
    updates.isActive = body.isActive
  }

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Brak pól do aktualizacji'
    })
  }

  let city
  try {
    [city] = await db
      .update(operatorCities)
      .set(updates)
      .where(eq(operatorCities.id, id))
      .returning()
  } catch (err: unknown) {
    const pgCode = (err as { code?: string })?.code || (err as { cause?: { code?: string } })?.cause?.code
    if (pgCode === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: `Miasto '${updates.name}' już istnieje`
      })
    }
    throw err
  }

  if (!city) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Miasto nie zostało znalezione'
    })
  }

  return {
    success: true,
    data: city
  }
})

import { createError, readBody } from 'h3'
import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'
import { operatorCities } from '../../../../db/schema'

export default apiHandler(async (event) => {
  const body = await readBody<{ name?: string, isActive?: boolean }>(event)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nazwa miasta jest wymagana'
    })
  }

  const values: typeof operatorCities.$inferInsert = { name }
  if (typeof body?.isActive === 'boolean') {
    values.isActive = body.isActive
  }

  try {
    const [city] = await db
      .insert(operatorCities)
      .values(values)
      .returning()

    return {
      success: true,
      data: city
    }
  } catch (err: unknown) {
    const cause = err instanceof Error ? err : undefined
    const pgCode = (cause as { code?: string } | undefined)?.code
      ?? ((cause as { cause?: { code?: string } } | undefined)?.cause?.code)
    if (pgCode === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: `Miasto "${name}" już istnieje`
      })
    }
    throw err
  }
})

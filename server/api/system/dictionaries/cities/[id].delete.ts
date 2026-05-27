import { eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
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

  const [city] = await db
    .delete(operatorCities)
    .where(eq(operatorCities.id, id))
    .returning({ id: operatorCities.id })

  if (!city) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Miasto nie zostało znalezione'
    })
  }

  return {
    success: true
  }
})

import { getQuery } from 'h3'
import { apiHandler } from '../../../../utils/api-handler'
import { db } from '../../../../utils/db'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const activeOnly = query.activeOnly === 'true'

  const cities = await db.query.operatorCities.findMany({
    ...(activeOnly
      ? {
          where: (city, { eq }) => eq(city.isActive, true)
        }
      : {}),
    orderBy: (city, { asc }) => asc(city.name)
  })

  return {
    success: true,
    data: cities
  }
})

import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const [media, technologies, teryt, simc, ulic] = await Promise.all([
    db.query.ukeMediumTypes.findMany({
      orderBy: (t, { asc }) => asc(t.code)
    }),
    db.query.ukeTechnologyTypes.findMany({
      orderBy: (t, { asc }) => asc(t.code)
    }),
    db.query.terytAreas.findMany({
      orderBy: (t, { asc }) => [asc(t.name), asc(t.areaType)]
    }),
    db.query.simcLocalities.findMany({
      with: {
        terytArea: true
      },
      orderBy: (t, { asc }) => asc(t.name)
    }),
    db.query.ulicStreets.findMany({
      with: {
        locality: true
      },
      orderBy: (t, { asc }) => [asc(t.name), asc(t.streetType)]
    })
  ])

  return {
    success: true,
    data: { media, technologies, teryt, simc, ulic }
  }
})

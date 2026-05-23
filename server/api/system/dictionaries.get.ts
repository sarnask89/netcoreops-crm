import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  const [media, technologies, teryt, simc, ulic] = await Promise.all([
    db.query.ukeMediumTypes.findMany({ orderBy: (table, { asc }) => [asc(table.code)] }),
    db.query.ukeTechnologyTypes.findMany({ orderBy: (table, { asc }) => [asc(table.code)] }),
    db.query.terytAreas.findMany({ orderBy: (table, { asc }) => [asc(table.terytCode)] }),
    db.query.simcLocalities.findMany({
      with: { terytArea: true },
      orderBy: (table, { asc }) => [asc(table.simcCode)]
    }),
    db.query.ulicStreets.findMany({
      with: { locality: { with: { terytArea: true } } },
      orderBy: (table, { asc }) => [asc(table.ulicCode)]
    })
  ])

  return {
    success: true,
    data: {
      media,
      technologies,
      teryt,
      simc,
      ulic
    }
  }
})

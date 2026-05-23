import 'dotenv/config'
import { inArray, not, sql } from 'drizzle-orm'
import { db, pool } from '../utils/db'
import {
  simcLocalities,
  terytAreas,
  ulicStreets
} from './schema'

async function main() {
  const sandomierzAreas = await db.query.terytAreas.findMany({
    where: sql`${terytAreas.terytCode} like '2609%'`
  })
  const areaIds = sandomierzAreas.map(area => area.id)

  if (areaIds.length === 0) {
    throw new Error('No Sandomierz TERYT areas found')
  }

  const sandomierzLocalities = await db.query.simcLocalities.findMany({
    where: inArray(simcLocalities.terytAreaId, areaIds)
  })
  const localityIds = sandomierzLocalities.map(locality => locality.id)

  if (localityIds.length > 0) {
    await db.delete(ulicStreets).where(not(inArray(ulicStreets.simcLocalityId, localityIds)))
  } else {
    await db.delete(ulicStreets)
  }

  await db.delete(simcLocalities).where(not(inArray(simcLocalities.terytAreaId, areaIds)))
  await db.delete(terytAreas).where(sql`${terytAreas.terytCode} not like '2609%'`)

  const [terytCount, simcCount, ulicCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(terytAreas),
    db.select({ count: sql<number>`count(*)` }).from(simcLocalities),
    db.select({ count: sql<number>`count(*)` }).from(ulicStreets)
  ])

  const terytRemaining = terytCount.at(0)?.count ?? 0
  const simcRemaining = simcCount.at(0)?.count ?? 0
  const ulicRemaining = ulicCount.at(0)?.count ?? 0

  console.log(JSON.stringify({
    remaining: {
      teryt: Number(terytRemaining),
      simc: Number(simcRemaining),
      ulic: Number(ulicRemaining)
    }
  }))
}

main()
  .then(async () => {
    await pool.end()
  })
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })

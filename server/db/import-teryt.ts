import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { XMLParser } from 'fast-xml-parser'
import { sql } from 'drizzle-orm'
import { db, pool } from '../utils/db'
import {
  simcLocalities,
  terytAreas,
  ulicStreets
} from './schema'

const SANDOMIERZ_WOJ = '26'
const SANDOMIERZ_POW = '09'
const BATCH_SIZE = 500

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false
})

type XmlRow = Record<string, string | undefined>

function rowsFromXml(xml: string) {
  const parsed = parser.parse(xml)
  const root = parsed.TERC || parsed.ULIC
  const rows = root?.row || []
  return Array.isArray(rows) ? rows as XmlRow[] : [rows as XmlRow]
}

function onlySandomierz(row: XmlRow) {
  return row.WOJ === SANDOMIERZ_WOJ && row.POW === SANDOMIERZ_POW
}

function terytCode(row: XmlRow) {
  return `${row.WOJ}${row.POW}${row.GMI}${row.RODZ || row.RODZ_GMI}`
}

async function importTerc(path: string) {
  const rows = rowsFromXml(await readFile(path, 'utf8')).filter(onlySandomierz)
  let imported = 0

  // Batch insert in chunks to avoid memory spikes
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map(row => ({
      terytCode: terytCode(row),
      name: row.NAZWA || '',
      areaType: row.NAZDOD || null,
      voivodeship: 'świętokrzyskie',
      county: 'sandomierski',
      commune: row.NAZWA || null
    }))

    await db.insert(terytAreas).values(batch).onConflictDoUpdate({
      target: terytAreas.terytCode,
      set: {
        name: sql`EXCLUDED.name`,
        areaType: sql`EXCLUDED.area_type`,
        voivodeship: sql`EXCLUDED.voivodeship`,
        county: sql`EXCLUDED.county`,
        commune: sql`EXCLUDED.commune`
      }
    })
    imported += batch.length
  }

  return imported
}

async function importSimc(path: string) {
  const rows = rowsFromXml(await readFile(path, 'utf8')).filter(onlySandomierz)
  let imported = 0

  // Pre-load all teryt areas once instead of querying per-row (eliminates N+1)
  const areaMap = new Map(
    (await db.query.terytAreas.findMany()).map(a => [a.terytCode, a])
  )

  // Batch insert in chunks
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((row) => {
      const area = areaMap.get(terytCode(row))
      return {
        simcCode: row.SYM || '',
        terytAreaId: area?.id ?? null,
        name: row.NAZWA || '',
        localityType: row.RM || null
      }
    })

    await db.insert(simcLocalities).values(batch).onConflictDoUpdate({
      target: simcLocalities.simcCode,
      set: {
        terytAreaId: sql`EXCLUDED.teryt_area_id`,
        name: sql`EXCLUDED.name`,
        localityType: sql`EXCLUDED.locality_type`
      }
    })
    imported += batch.length
  }

  return imported
}

async function importUlic(path: string) {
  const rows = rowsFromXml(await readFile(path, 'utf8')).filter(onlySandomierz)
  let imported = 0

  // Pre-load all simc localities once instead of querying per-row (eliminates N+1)
  const localityMap = new Map(
    (await db.query.simcLocalities.findMany()).map(l => [l.simcCode, l])
  )

  // Batch insert in chunks
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
      .filter(row => row.SYM && row.SYM_UL && localityMap.has(row.SYM))
      .map((row) => {
        const locality = localityMap.get(row.SYM!)!
        const streetName = [row.NAZWA_2, row.NAZWA_1].filter(Boolean).join(' ')

        return {
          ulicCode: row.SYM_UL!,
          simcLocalityId: locality.id,
          name: streetName,
          streetType: row.CECHA || null
        }
      })

    if (batch.length > 0) {
      await db.insert(ulicStreets).values(batch).onConflictDoUpdate({
        target: [ulicStreets.simcLocalityId, ulicStreets.ulicCode],
        set: {
          name: sql`EXCLUDED.name`,
          streetType: sql`EXCLUDED.street_type`
        }
      })
      imported += batch.length
    }
  }

  return imported
}

async function main() {
  const [tercPath, simcPath, ulicPath] = process.argv.slice(2)

  if (!tercPath || !simcPath || !ulicPath) {
    throw new Error('Usage: tsx server/db/import-teryt.ts TERC.xml SIMC.xml ULIC.xml')
  }

  console.log('Starting TERYT import...')
  const terc = await importTerc(tercPath)
  console.log(`Imported ${terc} TERC records`)

  console.log('Starting SIMC import...')
  const simc = await importSimc(simcPath)
  console.log(`Imported ${simc} SIMC records`)

  console.log('Starting ULIC import...')
  const ulic = await importUlic(ulicPath)
  console.log(`Imported ${ulic} ULIC records`)

  console.log(JSON.stringify({ imported: { terc, simc, ulic } }))
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

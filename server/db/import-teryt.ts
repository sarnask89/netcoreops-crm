import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { XMLParser } from 'fast-xml-parser'
import { eq } from 'drizzle-orm'
import { db, pool } from '../utils/db'
import {
  simcLocalities,
  terytAreas,
  ulicStreets
} from './schema'

const SANDOMIERZ_WOJ = '26'
const SANDOMIERZ_POW = '09'

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

  for (const row of rows) {
    await db.insert(terytAreas).values({
      terytCode: terytCode(row),
      name: row.NAZWA || '',
      areaType: row.NAZDOD || null,
      voivodeship: 'świętokrzyskie',
      county: 'sandomierski',
      commune: row.NAZWA || null
    }).onConflictDoUpdate({
      target: terytAreas.terytCode,
      set: {
        name: row.NAZWA || '',
        areaType: row.NAZDOD || null,
        voivodeship: 'świętokrzyskie',
        county: 'sandomierski',
        commune: row.NAZWA || null
      }
    })
    imported++
  }

  return imported
}

async function importSimc(path: string) {
  const rows = rowsFromXml(await readFile(path, 'utf8')).filter(onlySandomierz)
  let imported = 0

  for (const row of rows) {
    const area = await db.query.terytAreas.findFirst({
      where: eq(terytAreas.terytCode, terytCode(row))
    })

    await db.insert(simcLocalities).values({
      simcCode: row.SYM || '',
      terytAreaId: area?.id ?? null,
      name: row.NAZWA || '',
      localityType: row.RM || null
    }).onConflictDoUpdate({
      target: simcLocalities.simcCode,
      set: {
        terytAreaId: area?.id ?? null,
        name: row.NAZWA || '',
        localityType: row.RM || null
      }
    })
    imported++
  }

  return imported
}

async function importUlic(path: string) {
  const rows = rowsFromXml(await readFile(path, 'utf8')).filter(onlySandomierz)
  let imported = 0

  for (const row of rows) {
    const locality = await db.query.simcLocalities.findFirst({
      where: eq(simcLocalities.simcCode, row.SYM || '')
    })

    if (!locality || !row.SYM_UL) continue

    const streetName = [row.NAZWA_2, row.NAZWA_1].filter(Boolean).join(' ')

    await db.insert(ulicStreets).values({
      ulicCode: row.SYM_UL,
      simcLocalityId: locality.id,
      name: streetName,
      streetType: row.CECHA || null
    }).onConflictDoUpdate({
      target: [ulicStreets.simcLocalityId, ulicStreets.ulicCode],
      set: {
        name: streetName,
        streetType: row.CECHA || null
      }
    })
    imported++
  }

  return imported
}

async function main() {
  const [tercPath, simcPath, ulicPath] = process.argv.slice(2)

  if (!tercPath || !simcPath || !ulicPath) {
    throw new Error('Usage: tsx server/db/import-teryt.ts TERC.xml SIMC.xml ULIC.xml')
  }

  const terc = await importTerc(tercPath)
  const simc = await importSimc(simcPath)
  const ulic = await importUlic(ulicPath)

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

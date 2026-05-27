import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import {
  simcLocalities,
  terytAreas,
  ukeMediumTypes,
  ukeTechnologyTypes,
  ulicStreets
} from '../../../db/schema'
import { importDictionariesSchema } from '../../../utils/api-validation'
import { db } from '../../../utils/db'

function text(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim()
    }
  }

  return ''
}

export default apiHandler(async (event) => {
  const payload = importDictionariesSchema.parse(await readBody(event))
  let imported = 0

  for (const row of payload.rows) {
    if (payload.type === 'medium') {
      await db.insert(ukeMediumTypes).values({
        code: text(row, 'code', 'kod'),
        label: text(row, 'label', 'nazwa', 'name'),
        description: text(row, 'description', 'opis') || null
      }).onConflictDoUpdate({
        target: ukeMediumTypes.code,
        set: {
          label: text(row, 'label', 'nazwa', 'name'),
          description: text(row, 'description', 'opis') || null
        }
      })
      imported++
    }

    if (payload.type === 'technology') {
      await db.insert(ukeTechnologyTypes).values({
        code: text(row, 'code', 'kod'),
        label: text(row, 'label', 'nazwa', 'name'),
        description: text(row, 'description', 'opis') || null
      }).onConflictDoUpdate({
        target: ukeTechnologyTypes.code,
        set: {
          label: text(row, 'label', 'nazwa', 'name'),
          description: text(row, 'description', 'opis') || null
        }
      })
      imported++
    }

    if (payload.type === 'teryt') {
      await db.insert(terytAreas).values({
        terytCode: text(row, 'terytCode', 'teryt', 'kod'),
        name: text(row, 'name', 'nazwa'),
        areaType: text(row, 'areaType', 'typ') || null,
        voivodeship: text(row, 'voivodeship', 'wojewodztwo', 'województwo') || null,
        county: text(row, 'county', 'powiat') || null,
        commune: text(row, 'commune', 'gmina') || null
      }).onConflictDoUpdate({
        target: terytAreas.terytCode,
        set: {
          name: text(row, 'name', 'nazwa'),
          areaType: text(row, 'areaType', 'typ') || null,
          voivodeship: text(row, 'voivodeship', 'wojewodztwo', 'województwo') || null,
          county: text(row, 'county', 'powiat') || null,
          commune: text(row, 'commune', 'gmina') || null
        }
      })
      imported++
    }

    if (payload.type === 'simc') {
      const area = await db.query.terytAreas.findFirst({
        where: (table, { eq }) => eq(table.terytCode, text(row, 'terytCode', 'teryt'))
      })
      await db.insert(simcLocalities).values({
        simcCode: text(row, 'simcCode', 'simc', 'kod'),
        terytAreaId: area?.id ?? null,
        name: text(row, 'name', 'nazwa'),
        localityType: text(row, 'localityType', 'typ') || null
      }).onConflictDoUpdate({
        target: simcLocalities.simcCode,
        set: {
          terytAreaId: area?.id ?? null,
          name: text(row, 'name', 'nazwa'),
          localityType: text(row, 'localityType', 'typ') || null
        }
      })
      imported++
    }

    if (payload.type === 'ulic') {
      const locality = await db.query.simcLocalities.findFirst({
        where: (table, { eq }) => eq(table.simcCode, text(row, 'simcCode', 'simc'))
      })

      if (!locality) continue

      await db.insert(ulicStreets).values({
        ulicCode: text(row, 'ulicCode', 'ulic', 'kod'),
        simcLocalityId: locality.id,
        name: text(row, 'name', 'nazwa'),
        streetType: text(row, 'streetType', 'typ') || null
      }).onConflictDoUpdate({
        target: [ulicStreets.simcLocalityId, ulicStreets.ulicCode],
        set: {
          name: text(row, 'name', 'nazwa'),
          streetType: text(row, 'streetType', 'typ') || null
        }
      })
      imported++
    }
  }

  return { success: true, imported }
})

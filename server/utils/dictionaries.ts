import { and, eq, ilike, or } from 'drizzle-orm'
import {
  simcLocalities,
  terytAreas,
  ukeMediumTypes,
  ukeTechnologyTypes,
  ulicStreets
} from '../db/schema'
import { db } from './db'

export async function resolveMediumTypeId(code?: string | null) {
  if (!code) return null

  const medium = await db.query.ukeMediumTypes.findFirst({ where: eq(ukeMediumTypes.code, code) })
  return medium?.id ?? null
}

export async function resolveTechnologyTypeId(code?: string | null) {
  if (!code) return null

  const technology = await db.query.ukeTechnologyTypes.findFirst({ where: eq(ukeTechnologyTypes.code, code) })
  return technology?.id ?? null
}

export async function resolveAddressIds(address?: {
  terytCode: string
  simcCode: string
  ulicCode?: string | null
} | null) {
  if (!address) {
    return {
      terytAreaId: null,
      simcLocalityId: null,
      streetId: null
    }
  }

  const area = await db.query.terytAreas.findFirst({ where: eq(terytAreas.terytCode, address.terytCode) })
  const locality = await db.query.simcLocalities.findFirst({ where: eq(simcLocalities.simcCode, address.simcCode) })
  const street = address.ulicCode && locality
    ? await db.query.ulicStreets.findFirst({
        where: and(eq(ulicStreets.simcLocalityId, locality.id), eq(ulicStreets.ulicCode, address.ulicCode))
      })
    : null

  return {
    terytAreaId: area?.id ?? null,
    simcLocalityId: locality?.id ?? null,
    streetId: street?.id ?? null
  }
}

export async function searchAddresses(term: string) {
  const pattern = `%${term}%`
  const streets = await db.query.ulicStreets.findMany({
    where: or(ilike(ulicStreets.name, pattern), ilike(ulicStreets.ulicCode, pattern)),
    with: {
      locality: {
        with: {
          terytArea: true
        }
      }
    },
    limit: 20
  })

  return streets.map(street => ({
    label: `${street.streetType || 'ul.'} ${street.name}, ${street.locality.name}`,
    value: `${street.locality.terytArea?.terytCode || ''}:${street.locality.simcCode}:${street.ulicCode}`,
    terytCode: street.locality.terytArea?.terytCode || '',
    simcCode: street.locality.simcCode,
    ulicCode: street.ulicCode,
    locality: street.locality.name,
    street: street.name,
    streetType: street.streetType
  }))
}

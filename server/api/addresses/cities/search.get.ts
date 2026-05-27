import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { getQuery } from 'h3'
import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { operatorCities, simcLocalities } from '../../../db/schema'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const term = typeof query.q === 'string' ? query.q.trim() : ''

  if (term.length < 2) {
    return { success: true, data: [] }
  }

  const pattern = `%${term}%`

  const [operatorResults, simcResults] = await Promise.all([
    db
      .select({
        id: operatorCities.id,
        name: operatorCities.name
      })
      .from(operatorCities)
      .where(and(eq(operatorCities.isActive, true), ilike(operatorCities.name, pattern)))
      .orderBy(asc(operatorCities.name))
      .limit(25),
    db
      .select({
        id: simcLocalities.id,
        name: simcLocalities.name,
        simcCode: simcLocalities.simcCode,
        localityType: simcLocalities.localityType
      })
      .from(simcLocalities)
      .where(or(ilike(simcLocalities.name, pattern), ilike(simcLocalities.simcCode, pattern)))
      .orderBy(asc(simcLocalities.name))
      .limit(25)
  ])

  const normalizedTerm = term.toLocaleLowerCase('pl-PL')
  const suggestions = [
    ...operatorResults.map(city => ({
      source: 'operator' as const,
      id: city.id,
      name: city.name,
      label: `${city.name} (moja lista)`
    })),
    ...simcResults.map(locality => ({
      source: 'simc' as const,
      id: locality.id,
      name: locality.name,
      simcCode: locality.simcCode,
      localityType: locality.localityType,
      label: locality.simcCode
        ? `${locality.name} (SIMC ${locality.simcCode})`
        : locality.name
    }))
  ]
    .sort((a, b) => {
      const aName = a.name.toLocaleLowerCase('pl-PL')
      const bName = b.name.toLocaleLowerCase('pl-PL')
      const aCode = 'simcCode' in a ? a.simcCode || '' : ''
      const bCode = 'simcCode' in b ? b.simcCode || '' : ''
      const rank = (name: string, code: string, source: 'operator' | 'simc') => {
        if (name === normalizedTerm || code === normalizedTerm) return 0
        if (name.startsWith(normalizedTerm) || code.startsWith(normalizedTerm)) return 1
        if (source === 'operator') return 2
        return 3
      }
      return rank(aName, aCode, a.source) - rank(bName, bCode, b.source)
        || a.name.localeCompare(b.name, 'pl-PL')
        || a.source.localeCompare(b.source)
    })
    .slice(0, 10)

  return {
    success: true,
    data: suggestions
  }
})

import type { DriverLease } from '../network-drivers/types'
import { parseMikrotikComment, type ParsedMikrotikComment } from '../network-drivers/parsers/mikrotik-comment-parser'
import { parseRateLimit } from '../network-drivers/parsers/rate-limit-parser'

export interface ImportAddressMatch {
  terytAreaId: number | null
  simcLocalityId: number | null
  streetId: number | null
  label?: string
}

export interface EnrichedLeaseImport {
  parsed: ParsedMikrotikComment | null
  customerName: string
  hostname: string
  displayAddress: string | null
  issues: string[]
  isReady: boolean
  conflict: boolean
  tariffName: string | null
}

function normalizeMac(mac?: string | null) {
  return mac?.trim().replaceAll('-', ':').replaceAll('.', ':').toUpperCase() || null
}

export function importMacSuffix(mac?: string | null) {
  return normalizeMac(mac)?.replaceAll(':', '').slice(-12) || null
}

function fallbackSuffix(lease: DriverLease) {
  return importMacSuffix(lease.macAddress) || lease.address?.replaceAll('.', '-') || 'import'
}

export function formatParsedMikrotikAddress(parsed: ParsedMikrotikComment | null) {
  if (!parsed) return null

  return [
    parsed.streetName,
    parsed.streetNumber,
    parsed.apartmentNumber ? `/${parsed.apartmentNumber}` : ''
  ].join('').trim()
}

export function enrichMikrotikLeaseImport(
  lease: DriverLease,
  addressMatch: ImportAddressMatch | null,
  existingDeviceId?: string | null
): EnrichedLeaseImport {
  const parsed = parseMikrotikComment(lease.comment || '')
  const rate = parseRateLimit(lease.rateLimit)
  const issues: string[] = []
  const suffix = fallbackSuffix(lease)

  if (!parsed) issues.push('Nie rozpoznano komentarza')
  if (!lease.address) issues.push('Brak adresu IP')
  if (!lease.macAddress) issues.push('Brak MAC')
  if (parsed && !addressMatch?.streetId) issues.push(`Brak dopasowania ulicy: ${parsed.streetName}`)
  if (existingDeviceId) issues.push('Konflikt MAC z istniejącym urządzeniem')

  const customerName = parsed?.lastName ? `Abonent ${parsed.lastName}` : `Abonent ${suffix}`
  const hostnameSuffix = suffix.toLocaleLowerCase('pl-PL')
  const hostname = parsed?.lastName
    ? `${parsed.lastName.toLocaleLowerCase('pl-PL')}-${hostnameSuffix}.netcoreops`
    : `device-${hostnameSuffix}.netcoreops`

  return {
    parsed,
    customerName,
    hostname,
    displayAddress: addressMatch?.label || formatParsedMikrotikAddress(parsed),
    issues,
    isReady: issues.length === 0,
    conflict: Boolean(existingDeviceId),
    tariffName: rate.uploadMbps && rate.downloadMbps ? `Import ${rate.downloadMbps}/${rate.uploadMbps} Mbps` : null
  }
}

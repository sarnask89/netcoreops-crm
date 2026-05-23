import type { DasanMacTableRow } from '../network-drivers/parsers/dasan-parser'

export type TransparentOnuLinkType = 'BACKBONE_BEHIND_ONU' | 'CUSTOMER_DEVICE_BEHIND_ONU'

export interface TransparentOnuKnownMac {
  macAddress: string
  type: TransparentOnuLinkType
  targetId: string
}

export interface TransparentOnuDetectedLink {
  macAddress: string
  linkType: TransparentOnuLinkType
  targetId: string
}

export interface TransparentOnuAnalysis {
  transparentCandidate: boolean
  downstreamMacs: string[]
  links: TransparentOnuDetectedLink[]
}

function normalizeMac(macAddress?: string | null) {
  return macAddress?.trim().replaceAll('-', ':').toLowerCase() || null
}

function isMac(macAddress: string | null): macAddress is string {
  return macAddress !== null
}

export function analyzeTransparentOnu(
  macRows: Pick<DasanMacTableRow, 'macAddress' | 'vlanId'>[],
  knownMacs: TransparentOnuKnownMac[],
  managementMacs: string[] = []
): TransparentOnuAnalysis {
  const managementSet = new Set(managementMacs.map(normalizeMac).filter(mac => mac !== null))
  const knownByMac = new Map(knownMacs.map(row => [normalizeMac(row.macAddress), row] as const))
  const downstreamMacs = [...new Set(macRows
    .filter(row => row.vlanId !== '400')
    .map(row => normalizeMac(row.macAddress))
    .filter(isMac)
    .filter(mac => !managementSet.has(mac)))]

  const links = downstreamMacs.flatMap((macAddress) => {
    const known = knownByMac.get(macAddress)
    if (!known) return []

    return [{
      macAddress,
      linkType: known.type,
      targetId: known.targetId
    }]
  })

  return {
    transparentCandidate: downstreamMacs.length > 1,
    downstreamMacs,
    links
  }
}

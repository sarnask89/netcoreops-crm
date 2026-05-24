import type { DriverLease } from '../network-drivers/types'

function ipv4ToInt(address: string) {
  const octets = address.trim().split('.')
  if (octets.length !== 4) return null

  let value = 0
  for (const octetText of octets) {
    if (!/^\d+$/.test(octetText)) return null
    const octet = Number(octetText)
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null
    value = ((value << 8) + octet) >>> 0
  }

  return value >>> 0
}

function parseCidr(cidr: string) {
  const [address, prefixText] = cidr.trim().split('/')
  if (!address || prefixText === undefined) return null

  const prefix = Number(prefixText)
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null

  const networkAddress = ipv4ToInt(address)
  if (networkAddress === null) return null

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return {
    networkAddress,
    mask
  }
}

export function isIpInCidr(ipAddress: string, cidr: string) {
  const ip = ipv4ToInt(ipAddress)
  const network = parseCidr(cidr)
  if (ip === null || !network) return false

  return (ip & network.mask) >>> 0 === (network.networkAddress & network.mask) >>> 0
}

export function filterLeasesBySelectedNetworks(leases: DriverLease[], selectedNetworks: string[]) {
  const normalizedNetworks = selectedNetworks.map(network => network.trim()).filter(Boolean)
  if (!normalizedNetworks.length) return leases

  return leases.filter(lease => lease.address && normalizedNetworks.some(network => isIpInCidr(lease.address as string, network)))
}

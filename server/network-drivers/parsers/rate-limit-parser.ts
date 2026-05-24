export interface ParsedRateLimit {
  uploadMbps: number | null
  downloadMbps: number | null
}

function toMbps(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  if (normalized.endsWith('m')) return Math.max(1, Math.round(Number.parseFloat(normalized.slice(0, -1))))
  if (normalized.endsWith('k')) return Math.max(1, Math.round(Number.parseFloat(normalized.slice(0, -1)) / 1024))

  const bits = Number.parseInt(normalized, 10)
  if (!Number.isFinite(bits)) return null

  return Math.max(1, Math.round(bits / 1024 / 1024))
}

export function parseRateLimit(rateLimit?: string | null): ParsedRateLimit {
  if (!rateLimit || !rateLimit.includes('/')) return { uploadMbps: null, downloadMbps: null }

  const [uploadRaw = '', downloadRaw = ''] = rateLimit.split('/')

  return {
    uploadMbps: toMbps(uploadRaw),
    downloadMbps: toMbps(downloadRaw)
  }
}

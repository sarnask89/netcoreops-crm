export default defineEventHandler(async () => {
  const response = await fetch('http://127.0.0.1:11434/api/tags').catch(() => null)
  if (!response || !response.ok) {
    return {
      success: true,
      data: ['netcoreops-module-coder']
    }
  }

  const payload = await response.json() as { models?: Array<{ name?: string }> }
  const names = (payload.models || [])
    .map(item => item.name || '')
    .filter(Boolean)

  return {
    success: true,
    data: names.length > 0 ? names : ['netcoreops-module-coder']
  }
})

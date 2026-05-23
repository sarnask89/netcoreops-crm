function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return ''

  const text = String(value)

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: Array<keyof T>) {
  return [
    headers.map(header => escapeCsvValue(header)).join(','),
    ...rows.map(row => headers.map(header => escapeCsvValue(row[header])).join(','))
  ].join('\n')
}

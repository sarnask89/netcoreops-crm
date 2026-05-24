const streetShortcutMap: Record<string, string> = {
  kos: 'Romana Koseły',
  kro: 'Tadeusza Króla',
  krol: 'Tadeusza Króla',
  mic: 'Adama Mickiewicza',
  mac: 'Ignacego Maciejowskiego',
  mil: 'Milberta',
  sch: 'Schinzla',
  cie: 'Cieśli',
  slo: 'Słowackiego',
  chwa: 'os. Chwałki',
  ak: 'Armii Krajowej',
  pils: 'Piłsudskiego',
  kier: 'Kierzkowska',
  krak: 'Krakowska',
  m: 'Mickiewicza',
  zar: 'Zarzekowice',
  zam: 'Zamkowa',
  obr: 'Obrońców',
  zol: 'Żółkiewskiego'
}

export interface ParsedMikrotikComment {
  externalId: string
  lastName: string
  apartmentNumber: string
  streetName: string
  streetNumber: string
}

function toTitleCase(value: string) {
  return value
    .split('-')
    .map(part => part.charAt(0).toLocaleUpperCase('pl-PL') + part.slice(1).toLocaleLowerCase('pl-PL'))
    .join('-')
}

export function parseMikrotikComment(comment: string): ParsedMikrotikComment | null {
  if (!comment.trim()) return null

  const pattern = /(\d+)\s+([A-Za-zÀ-ÿ-]+)\s+(?:(?:M\/|m\.\s*|m)(\d+)\s+)?([A-Za-z]+)\s*(\d+[A-Za-z]?)/i
  const match = comment.trim().match(pattern)
  if (!match) return null

  const externalId = match[1]
  const lastName = match[2]
  const shortcutRaw = match[4]
  const streetNumber = match[5]
  if (!externalId || !lastName || !shortcutRaw || !streetNumber) return null

  const shortcut = shortcutRaw.toLocaleLowerCase('pl-PL')

  return {
    externalId,
    lastName: toTitleCase(lastName),
    apartmentNumber: match[3] || '',
    streetName: streetShortcutMap[shortcut] || shortcutRaw,
    streetNumber: streetNumber.toLocaleUpperCase('pl-PL')
  }
}

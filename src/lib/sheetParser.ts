import type { RainfallRecord } from '@/types/rainfall'

// Maps sheet column names (ALL CAPS) to app display names
const SHEET_NAME_MAP: Record<string, string> = {
  'AMBALLOR KAVU': 'Amballor Kavu',
  'MAXWELL': 'Maxwell',
  'KADAPURAM': 'Kadapuram',
  'MAMPUZHA': 'Mampuzha',
  'VIDANGARA TEMPLE': 'Vidangara Temple',
  'PUTHUVASSERY': 'Puthuvassery',
  'KEECHERY': 'Keechery',
  'PUNCHAPADAM': 'Punchapadam',
  'PARPACODE': 'Parpacode',
  'MILLUNKAL': 'Millunkal',
  'ARAYANKAVU': 'Arayankavu',
  'ERATTAMAVU': 'Erattamavu',
}

// Parses "8/8/2025" (M/D/YYYY) → Date
function parseDateStr(dateStr: string): Date | null {
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const month = parseInt(match[1], 10) - 1 // JS months are 0-indexed
  const day   = parseInt(match[2], 10)
  const year  = parseInt(match[3], 10)
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null
  return new Date(year, month, day)
}

// Sheet format (wide/pivot):
//   Row 0: grid codes — skip
//   Row 1: DAY/Locations, AMBALLOR KAVU, MAXWELL, ...
//   Row 2+: 8/8/2025, 34.5, 16, 18, ...
export function parseSheetCsv(csv: string): RainfallRecord[] {
  const rows = csv
    .trim()
    .split('\n')
    .map((r) => r.split(',').map((c) => c.trim()))

  if (rows.length < 3) return []

  // Row 1 has location names starting at index 1
  const locationNames = rows[1].slice(1).map((name) => SHEET_NAME_MAP[name] ?? name)

  const records: RainfallRecord[] = []
  for (let i = 2; i < rows.length; i++) {
    const [dateStr, ...rawValues] = rows[i]
    if (!dateStr) continue
    // Skip rows where every location value is blank (pre-filled future dates)
    if (rawValues.every(v => v === '')) continue
    const timestamp = parseDateStr(dateStr)
    if (!timestamp) continue

    locationNames.forEach((location, idx) => {
      const rainfallMm = parseFloat(rawValues[idx] ?? '0')
      if (!location) return
      records.push({ timestamp, location, rainfallMm: isNaN(rainfallMm) ? 0 : rainfallMm })
    })
  }
  return records
}

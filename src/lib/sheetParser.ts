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

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

// Parses "Aug-08" → Date, assigning the most recent past occurrence of that month+day
function parseDateStr(dateStr: string): Date | null {
  const match = dateStr.trim().match(/^([A-Za-z]{3})-(\d{2})$/)
  if (!match) return null
  const month = MONTH_MAP[match[1]]
  const day = parseInt(match[2], 10)
  if (month === undefined || isNaN(day)) return null

  const now = new Date()
  let year = now.getFullYear()
  const candidate = new Date(year, month, day)
  // If this date is in the future, use last year
  if (candidate > now) year -= 1
  return new Date(year, month, day)
}

// Sheet format (wide/pivot):
//   Row 0: grid codes — skip
//   Row 1: DAY/Locations, AMBALLOR KAVU, MAXWELL, ...
//   Row 2+: Aug-08, 34.5, 16, 18, ...
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
    const [dateStr, ...values] = rows[i]
    if (!dateStr) continue
    const timestamp = parseDateStr(dateStr)
    if (!timestamp) continue

    locationNames.forEach((location, idx) => {
      const rainfallMm = parseFloat(values[idx] ?? '0')
      if (!location) return
      records.push({ timestamp, location, rainfallMm: isNaN(rainfallMm) ? 0 : rainfallMm })
    })
  }
  return records
}

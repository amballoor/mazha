import type { RainfallRecord, RainfallStatus } from '@/types/rainfall'

export function getRainfallStatus(mm: number): RainfallStatus {
  if (mm === 0)   return 'none'
  if (mm <= 40)   return 'blue'
  if (mm <= 65)   return 'yellow'
  if (mm <= 100)  return 'orange'
  return 'red'
}

export function getStatusLabel(status: RainfallStatus): string {
  if (status === 'none')   return 'No Rain'
  if (status === 'yellow') return 'Yellow Alert'
  if (status === 'orange') return 'Orange Alert'
  if (status === 'red')    return 'Red Alert'
  return ''
}

export function getProgressPercent(mm: number, maxMm: number): number {
  if (maxMm <= 0) return 0
  return Math.min(100, (mm / maxMm) * 100)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function filterByDay(records: RainfallRecord[], day: Date): RainfallRecord[] {
  return records.filter((r) => isSameDay(r.timestamp, day))
}

export function filterByDateRange(
  records: RainfallRecord[],
  from: Date,
  to: Date,
): RainfallRecord[] {
  const fromDay = startOfDay(from)
  const toDay = endOfDay(to)
  return records.filter((r) => r.timestamp >= fromDay && r.timestamp <= toDay)
}

export function sumForLocation(
  records: RainfallRecord[],
  location: string,
  from: Date,
  to: Date,
): number {
  return filterByDateRange(records, from, to)
    .filter((r) => r.location === location)
    .reduce((sum, r) => sum + r.rainfallMm, 0)
}

export function groupByDate(
  records: RainfallRecord[],
  location: string,
): { date: Date; mm: number }[] {
  const filtered = records.filter((r) => r.location === location)
  const map = new Map<string, { date: Date; mm: number }>()
  for (const r of filtered) {
    const key = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}-${r.timestamp.getDate()}`
    const existing = map.get(key)
    if (existing) {
      existing.mm += r.rainfallMm
    } else {
      map.set(key, { date: r.timestamp, mm: r.rainfallMm })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function getWeekRange(anchor: Date): { start: Date; end: Date } {
  const end = startOfDay(anchor)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  return { start, end: endOfDay(anchor) }
}

export function getCalendarWeekRange(date: Date): { start: Date; end: Date } {
  const d = startOfDay(date)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay()) // back to Sunday
  const end = new Date(start)
  end.setDate(start.getDate() + 6)        // forward to Saturday
  return { start, end: endOfDay(end) }
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

// Returns most recent date present in dataset, or today if empty
export function getMostRecentDate(records: RainfallRecord[]): Date {
  if (records.length === 0) return startOfDay(new Date())
  const latest = records.reduce((max, r) =>
    r.timestamp > max ? r.timestamp : max,
    records[0].timestamp,
  )
  return startOfDay(latest)
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatWeekRange(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
  return `${s} – ${e}`
}

export function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

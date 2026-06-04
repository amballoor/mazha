export type RainfallRecord = {
  timestamp: Date
  location: string // must match a display name in locations.ts exactly
  rainfallMm: number
}

export type TimeRange = 'day' | 'week' | 'month'

export type RainfallStatus = 'none' | 'light' | 'moderate' | 'heavy'

export type SortMode = 'high-to-low' | 'low-to-high' | 'alpha'

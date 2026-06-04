import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets } from 'lucide-react'
import { useRainfallData } from '@/hooks/useRainfallData'
import { LOCATIONS } from '@/data/locations'
import { HeaderCard } from '@/components/HeaderCard'
import { TabStrip } from '@/components/TabStrip'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import { SortButton } from '@/components/SortButton'
import { SortSheet } from '@/components/SortSheet'
import { ShareButton } from '@/components/ShareButton'
import type { RainfallRecord, SortMode } from '@/types/rainfall'
import {
  filterByDay,
  filterByDateRange,
  getWeekRange,
  getMostRecentDate,
  startOfDay,
  formatDay,
  formatWeekRange,
} from '@/lib/rainfallUtils'

function getRainyDates(records: RainfallRecord[]): Set<string> {
  const s = new Set<string>()
  for (const r of records) {
    if (r.rainfallMm > 0) s.add(startOfDay(r.timestamp).toISOString())
  }
  return s
}

function SkeletonRow() {
  return (
    <li
      className="flex flex-col gap-[6px] h-16 w-full px-3 py-[10px] rounded-lg shrink-0 animate-pulse"
      style={{ background: 'var(--mw-surface)' }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="h-4 w-32 rounded" style={{ background: 'var(--mw-progress-track)' }} />
        <div className="h-4 w-16 rounded" style={{ background: 'var(--mw-progress-track)' }} />
      </div>
      <div className="h-[6px] w-full rounded-[3px]" style={{ background: 'var(--mw-progress-track)' }} />
    </li>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { data: records = [], isLoading, isError } = useRainfallData()

  const [tab, setTab] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showRainOnly, setShowRainOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('high-to-low')
  const [sortSheetOpen, setSortSheetOpen] = useState(false)

  const today = startOfDay(new Date())
  const mostRecent = records.length > 0 ? getMostRecentDate(records) : today
  const displayDate = selectedDate ?? mostRecent

  const rainyDates = useMemo(() => getRainyDates(records), [records])

  function prevDay() {
    setSelectedDate((d) => {
      const prev = new Date(d ?? displayDate)
      prev.setDate(prev.getDate() - 1)
      return prev
    })
  }
  function nextDay() {
    setSelectedDate((d) => {
      const next = new Date(d ?? displayDate)
      next.setDate(next.getDate() + 1)
      return next
    })
  }
  function prevWeek() {
    setSelectedDate((d) => {
      const prev = new Date(d ?? displayDate)
      prev.setDate(prev.getDate() - 7)
      return prev
    })
  }
  function nextWeek() {
    setSelectedDate((d) => {
      const next = new Date(d ?? displayDate)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  function prevRainyDay() {
    setSelectedDate((d) => {
      let c = new Date(d ?? displayDate)
      for (let i = 0; i < 365; i++) {
        c = new Date(c)
        c.setDate(c.getDate() - 1)
        if (rainyDates.has(startOfDay(c).toISOString())) return c
      }
      return d ?? displayDate
    })
  }
  function nextRainyDay() {
    setSelectedDate((d) => {
      let c = new Date(d ?? displayDate)
      for (let i = 0; i < 365; i++) {
        c = new Date(c)
        c.setDate(c.getDate() + 1)
        if (c > today) return d ?? displayDate
        if (rainyDates.has(startOfDay(c).toISOString())) return c
      }
      return d ?? displayDate
    })
  }

  const { start: weekStart, end: weekEnd } = getWeekRange(displayDate)

  const dateLabel =
    tab === 'day'
      ? formatDay(displayDate)
      : formatWeekRange(weekStart, weekEnd)

  const isNextDisabled = displayDate >= today

  const hasPrevRainyDay = showRainOnly
    ? [...rainyDates].some(d => new Date(d) < displayDate)
    : true
  const isPrevDisabled = showRainOnly && !hasPrevRainyDay

  const locationValues = LOCATIONS.map((loc) => {
    let mm = 0
    if (tab === 'day') {
      const dayRecords = filterByDay(records, displayDate)
      mm = dayRecords.find((r) => r.location === loc.name)?.rainfallMm ?? 0
    } else {
      const rangeRecords = filterByDateRange(records, weekStart, weekEnd)
      mm = rangeRecords
        .filter((r) => r.location === loc.name)
        .reduce((sum, r) => sum + r.rainfallMm, 0)
    }
    return { loc, mm }
  })

  const displayedLocations =
    sortMode === 'high-to-low' ? [...locationValues].sort((a, b) => b.mm - a.mm)
    : sortMode === 'low-to-high' ? [...locationValues].sort((a, b) => a.mm - b.mm)
    : [...locationValues].sort((a, b) => a.loc.name.localeCompare(b.loc.name))

  const MAX_MM = tab === 'week' ? 350 : 130

  const blueShadeMap = useMemo(() => {
    const SHADES = [
      'var(--mw-fill-700)', 'var(--mw-fill-600)', 'var(--mw-fill-500)',
      'var(--mw-fill-400)', 'var(--mw-fill-300)', 'var(--mw-fill-200)',
      'var(--mw-fill-100)',
    ]
    const blues = locationValues
      .filter(v => v.mm > 0 && v.mm <= 40)
      .sort((a, b) => b.mm - a.mm)
    const map = new Map<string, string>()
    blues.forEach((v, i) => map.set(v.loc.slug, SHADES[Math.min(i, SHADES.length - 1)]))
    return map
  }, [locationValues])


  return (
    <div
      className="min-h-screen px-5 py-[28px]"
      style={{ background: 'var(--color-background, white)' }}
    >
      <HeaderCard />

      {/* Section heading */}
      <div className="flex items-center gap-2 w-full my-6">
        <div className="flex-1 h-px" style={{ background: 'var(--mw-border)' }} />
        <span
          className="text-[14px] font-semibold leading-none shrink-0"
          style={{ color: 'var(--mw-text-primary)' }}
        >
          Rainfall History
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--mw-border)' }} />
      </div>

      <div className="flex flex-col gap-6">
        <TabStrip active={tab} onChange={setTab} />

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DateNav
                label={dateLabel}
                onPrev={showRainOnly ? prevRainyDay : (tab === 'day' ? prevDay : prevWeek)}
                onNext={showRainOnly ? nextRainyDay : (tab === 'day' ? nextDay : nextWeek)}
                disableNext={isNextDisabled}
                disablePrev={isPrevDisabled}
                selectedDate={displayDate}
                onDateSelect={setSelectedDate}
                maxDate={today}
                disabledDates={showRainOnly
                  ? (date) => !rainyDates.has(startOfDay(date).toISOString())
                  : undefined}
                showRainOnly={showRainOnly}
                onToggleRainOnly={() => setShowRainOnly((v) => !v)}
              />
            </div>
            <SortButton onClick={() => setSortSheetOpen(true)} />
          </div>

          {isError && (
            <p className="text-center text-sm py-3 px-4 rounded-lg" style={{ background: '#fff3f3', color: '#e82c2c' }}>
              Could not load rainfall data. Check your internet connection and try refreshing.
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {isLoading
              ? LOCATIONS.map((loc) => <SkeletonRow key={loc.slug} />)
              : displayedLocations.map(({ loc, mm }) => (
                  <StationRow
                    key={loc.slug}
                    label={loc.name}
                    rainfallMm={mm}
                    maxMm={MAX_MM}
                    blueShade={blueShadeMap.get(loc.slug)}
                    onClick={() => navigate(`/location/${loc.slug}`, { state: { date: displayDate.toISOString() } })}
                  />
                ))}
          </ul>

          {tab === 'day' && (
            <ShareButton
              entries={locationValues.map(({ loc, mm }) => ({
                location: loc.name,
                rainfallMm: mm,
              }))}
              date={displayDate}
            />
          )}

          <div className="flex justify-center mt-16 mb-4">
            <Droplets size={40} style={{ color: 'var(--mw-progress-fill)' }} />
          </div>
        </div>
      </div>

      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sortMode}
        onSelect={(mode) => { setSortMode(mode); setSortSheetOpen(false) }}
      />
    </div>
  )
}

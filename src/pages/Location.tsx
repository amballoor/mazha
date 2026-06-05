import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import { ChevronLeft, CalendarDays, List } from 'lucide-react'
import { getLocationBySlug } from '@/data/locations'
import { useRainfallData } from '@/hooks/useRainfallData'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import { ShareButton } from '@/components/ShareButton'
import { SortButton } from '@/components/SortButton'
import { LocationSortSheet, type LocationSortMode } from '@/components/LocationSortSheet'
import {
  groupByDate,
  sumForLocation,
  startOfDay,
  formatShortDate,
  formatMonth,
  getRainfallStatus,
  getProgressPercent,
} from '@/lib/rainfallUtils'

function getCalendarFillColor(mm: number): string {
  const status = getRainfallStatus(mm)
  switch (status) {
    case 'yellow': return 'var(--mw-alert-yellow)'
    case 'orange': return 'var(--mw-alert-orange)'
    case 'red':    return 'var(--mw-alert-red)'
    case 'blue':   return 'var(--mw-fill-700)'
    default:       return 'transparent'
  }
}

const ROWS_PER_PAGE = 7
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      <span className="text-[16px] leading-none whitespace-nowrap" style={{ color: 'var(--mw-text-muted)' }}>
        {label}
      </span>
      <span className="text-[18px] font-semibold leading-none" style={{ color: 'var(--mw-text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const routerState = (useRouterLocation().state as { date?: string } | null)
  const location = getLocationBySlug(slug ?? '')
  const { data: records = [] } = useRainfallData()

  const initialDate = routerState?.date ? new Date(routerState.date) : new Date()
  const focusDate: Date | null = routerState?.date ? startOfDay(new Date(routerState.date)) : null

  const [view, setView] = useState<'list' | 'month'>('list')
  const [sortMode, setSortMode] = useState<LocationSortMode>('date-desc')
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_PAGE)
  const [activeTip, setActiveTip] = useState<string | null>(null)
  const focusRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (focusRef.current) {
      setTimeout(() => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    }
  }, [])

  if (!location) {
    return (
      <div className="p-5">
        <button onClick={() => navigate(-1)} className="text-[16px]" style={{ color: 'var(--mw-text-primary)' }}>
          ← Back
        </button>
        <p className="mt-4" style={{ color: 'var(--mw-text-muted)' }}>Location not found.</p>
      </div>
    )
  }

  const now = new Date()
  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)

  const yesterdayMm = sumForLocation(records, location.name, yesterday, yesterday)
  const weekMm = sumForLocation(records, location.name, weekAgo, today)
  const yesterdayLabel = `Yesterday (${formatShortDate(yesterday)})`

  const allHistory = groupByDate(records, location.name).filter(row =>
    row.date.getFullYear() === selectedMonth.getFullYear() &&
    row.date.getMonth() === selectedMonth.getMonth()
  )

  const MAX_MM = 130
  const sortedHistory =
    sortMode === 'high-to-low' ? [...allHistory].sort((a, b) => b.mm - a.mm)
    : sortMode === 'low-to-high' ? [...allHistory].sort((a, b) => a.mm - b.mm)
    : sortMode === 'date-asc' ? [...allHistory].sort((a, b) => a.date.getTime() - b.date.getTime())
    : [...allHistory].sort((a, b) => b.date.getTime() - a.date.getTime())
  const visibleHistory = sortedHistory.slice(0, visibleCount)
  const hasMore = visibleCount < allHistory.length

  const SHADES = [
    'var(--mw-fill-700)', 'var(--mw-fill-600)', 'var(--mw-fill-500)',
    'var(--mw-fill-400)', 'var(--mw-fill-300)', 'var(--mw-fill-200)',
    'var(--mw-fill-100)',
  ]
  const blueShadeMap = useMemo(() => {
    const blues = allHistory
      .filter(r => r.mm > 0 && r.mm <= 40)
      .sort((a, b) => b.mm - a.mm)
    const map = new Map<string, string>()
    blues.forEach((r, i) =>
      map.set(startOfDay(r.date).toISOString(), SHADES[Math.min(i, SHADES.length - 1)])
    )
    return map
  }, [allHistory])

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const isCurrentMonth = selectedMonth >= currentMonthStart

  const rainyDaySet = new Set(allHistory.map(r => startOfDay(r.date).toISOString()))
  const dataByDate = new Map(allHistory.map(r => [startOfDay(r.date).toISOString(), r.mm]))

  function prevMonth() {
    setSelectedMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    setVisibleCount(ROWS_PER_PAGE)
  }
  function nextMonth() {
    setSelectedMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    setVisibleCount(ROWS_PER_PAGE)
  }

  const calendarDays = getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth())
  const firstDayOffset = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()

  const shareEntries = allHistory.map(r => ({
    location: formatShortDate(r.date),
    rainfallMm: r.mm,
  }))

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--color-background, white)' }}>

      {/* Top nav */}
      <div className="flex items-center justify-between px-5 py-6">
        <button
          className="flex items-center gap-2 min-h-[48px]"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={18} style={{ color: 'var(--mw-text-primary)' }} />
          <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>Back</span>
        </button>
      </div>

      <div className="flex flex-col gap-7 px-5">

        {/* Hero card */}
        <div
          className="flex flex-col gap-4 p-5 rounded-xl"
          style={{ background: 'var(--mw-surface)', border: '1px solid var(--mw-border)' }}
        >
          <p className="text-[26px] font-normal leading-tight w-full" style={{ color: 'var(--mw-text-primary)' }}>
            {location.name}
          </p>
          <div className="flex items-start justify-between overflow-hidden whitespace-nowrap">
            <StatBlock label={yesterdayLabel} value={`${yesterdayMm.toFixed(1)} mm`} />
            <StatBlock label="This Week Overall" value={`${weekMm.toFixed(1)} mm`} />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-6 w-full">
          <div className="flex-1">
            <DateNav
              label={formatMonth(selectedMonth)}
              onPrev={prevMonth}
              onNext={nextMonth}
              disableNext={isCurrentMonth}
              selectedDate={selectedMonth}
              onDateSelect={(date) =>
                setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1))
              }
              calendarMode="month"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle — blue border, padding-driven width */}
            <button
              onClick={() => setView(v => v === 'list' ? 'month' : 'list')}
              className="flex items-center justify-center h-[42px] rounded-lg"
              style={{ background: '#f9fcfd', border: '1px solid var(--mw-progress-fill)', paddingLeft: 12, paddingRight: 12 }}
              aria-label={view === 'list' ? 'Switch to month view' : 'Switch to list view'}
            >
              {view === 'list'
                ? <CalendarDays size={24} style={{ color: 'var(--mw-progress-fill)' }} />
                : <List size={24} style={{ color: 'var(--mw-progress-fill)' }} />
              }
            </button>

            {/* Sort — active in list, disabled in month */}
            <div style={{ opacity: view === 'month' ? 0.5 : 1, pointerEvents: view === 'month' ? 'none' : 'auto' }}>
              <SortButton onClick={() => setSortSheetOpen(true)} />
            </div>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            <ul className="flex flex-col gap-2">
              {allHistory.length === 0 ? (
                <li className="text-[16px] py-4" style={{ color: 'var(--mw-text-muted)' }}>
                  No data for this month.
                </li>
              ) : (
                visibleHistory.map(row => {
                  const iso = startOfDay(row.date).toISOString()
                  const isFocused = focusDate?.toISOString() === iso
                  return (
                    <StationRow
                      key={iso}
                      ref={isFocused ? focusRef : undefined}
                      label={formatShortDate(row.date)}
                      rainfallMm={row.mm}
                      maxMm={MAX_MM}
                      blueShade={blueShadeMap.get(iso)}
                    />
                  )
                })
              )}
            </ul>

            {hasMore && (
              <button
                className="flex items-center justify-center w-full h-[52px] rounded-lg text-[16px] font-medium"
                style={{
                  background: 'white',
                  border: '1px solid var(--mw-text-primary)',
                  color: 'var(--mw-text-primary)',
                }}
                onClick={() => setVisibleCount(c => c + ROWS_PER_PAGE)}
              >
                View previous days
              </button>
            )}

            <ShareButton entries={shareEntries} date={selectedMonth} />
          </>
        )}

        {/* ── MONTH VIEW ── */}
        {view === 'month' && (
          <>
            <div onClick={() => setActiveTip(null)}>
              <div
                className="rounded-lg flex flex-col gap-3"
                style={{ background: 'var(--mw-surface)', padding: 10 }}
              >
                {/* Day headers — Su Mo Tu We Th Fr Sa */}
                <div className="flex gap-2 opacity-70">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="flex-1 flex items-center justify-center" style={{ padding: 4 }}>
                      <span className="text-[12px] font-normal leading-none" style={{ color: 'var(--mw-text-muted)' }}>
                        {d}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calendar day grid */}
                {(() => {
                  const cells: (Date | null)[] = [
                    ...Array(firstDayOffset).fill(null),
                    ...calendarDays,
                  ]
                  const rows: (Date | null)[][] = []
                  for (let i = 0; i < cells.length; i += 7) {
                    rows.push(cells.slice(i, i + 7))
                  }
                  const last = rows[rows.length - 1]
                  while (last.length < 7) last.push(null)

                  return rows.map((row, ri) => (
                    <div key={ri} className="flex gap-2">
                      {row.map((day, ci) => {
                        if (!day) return <div key={ci} className="flex-1" style={{ height: 38 }} />
                        const iso = startOfDay(day).toISOString()
                        const mm = dataByDate.get(iso) ?? 0
                        const hasData = rainyDaySet.has(iso)
                        const fillWidthPct = hasData ? getProgressPercent(mm, MAX_MM) : 0
                        const fillColor = getCalendarFillColor(mm)
                        const tipOpen = activeTip === iso
                        return (
                          <div
                            key={ci}
                            className="flex-1 relative flex items-center justify-center overflow-visible"
                            style={{
                              height: 38,
                              padding: 4,
                              border: '1px solid var(--mw-border)',
                              borderRadius: 4,
                            }}
                            onClick={hasData ? (e) => { e.stopPropagation(); setActiveTip(tipOpen ? null : iso) } : undefined}
                          >
                            {hasData && (
                              <span
                                className="absolute rounded-tl-[4px] rounded-bl-[4px]"
                                style={{
                                  top: -1, left: -1, bottom: -1,
                                  width: `${fillWidthPct.toFixed(1)}%`,
                                  background: fillColor,
                                }}
                              />
                            )}
                            <span
                              className="relative text-[12px] font-normal leading-none"
                              style={{
                                color: hasData ? 'var(--mw-text-primary)' : 'var(--mw-text-muted)',
                                zIndex: 1,
                              }}
                            >
                              {String(day.getDate()).padStart(2, '0')}
                            </span>
                            {tipOpen && (
                              <div
                                className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] z-10
                                            px-2 py-1 rounded-md text-white text-[12px] font-normal
                                            whitespace-nowrap pointer-events-none"
                                style={{ background: 'var(--mw-text-primary)' }}
                              >
                                {mm.toFixed(1)} mm
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()}
              </div>
            </div>

            <ShareButton entries={shareEntries} date={selectedMonth} />
          </>
        )}

      </div>

      <LocationSortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sortMode}
        onSelect={(mode) => { setSortMode(mode); setSortSheetOpen(false) }}
      />
    </div>
  )
}

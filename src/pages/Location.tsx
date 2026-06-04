import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import { ChevronLeft, CalendarDays, List, ArrowUpDown } from 'lucide-react'
import { getLocationBySlug } from '@/data/locations'
import { useRainfallData } from '@/hooks/useRainfallData'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import { ShareButton } from '@/components/ShareButton'
import type { RainfallStatus } from '@/types/rainfall'
import {
  groupByDate,
  sumForLocation,
  startOfDay,
  formatShortDate,
  formatMonth,
  getRainfallStatus,
} from '@/lib/rainfallUtils'

function getCalendarFillColor(status: RainfallStatus): string {
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

  const maxMm = Math.max(...allHistory.map(r => r.mm), 1)
  const visibleHistory = allHistory.slice(0, visibleCount)
  const hasMore = visibleCount < allHistory.length

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
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setView(v => v === 'list' ? 'month' : 'list')}
              className="flex items-center justify-center h-[42px] w-[42px] rounded-lg"
              style={{ background: '#f9fcfd', border: '1px solid var(--mw-text-muted)' }}
              aria-label={view === 'list' ? 'Switch to month view' : 'Switch to list view'}
            >
              {view === 'list'
                ? <CalendarDays size={24} style={{ color: 'var(--mw-text-muted)' }} />
                : <List size={24} style={{ color: 'var(--mw-text-muted)' }} />
              }
            </button>
            <button
              className="flex items-center justify-center h-[42px] w-[42px] rounded-lg"
              style={{ background: '#f9fcfd', border: '1px solid var(--mw-progress-fill)' }}
              aria-label="Sort"
            >
              <ArrowUpDown size={24} style={{ color: 'var(--mw-progress-fill)' }} />
            </button>
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
                      maxMm={maxMm}
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
            {/* Dismiss tooltip on outside tap */}
            <div onClick={() => setActiveTip(null)}>
              <div className="rounded-lg p-3 flex flex-col gap-3" style={{ background: 'var(--mw-surface)' }}>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 opacity-70">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="flex items-center justify-center py-1">
                      <span className="text-[12px] font-medium leading-none" style={{ color: 'var(--mw-text-muted)' }}>
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
                    <div key={ri} className="grid grid-cols-7 gap-2">
                      {row.map((day, ci) => {
                        if (!day) return <div key={ci} />
                        const iso = startOfDay(day).toISOString()
                        const mm = dataByDate.get(iso) ?? 0
                        const hasData = rainyDaySet.has(iso)
                        const status = getRainfallStatus(mm)
                        const fillColor = getCalendarFillColor(status)
                        const tipOpen = activeTip === iso
                        return (
                          <div
                            key={ci}
                            className="relative flex items-center justify-center py-[6px] rounded-[4px] overflow-visible"
                            style={{ border: '1px solid var(--mw-border)' }}
                            onClick={hasData ? (e) => { e.stopPropagation(); setActiveTip(tipOpen ? null : iso) } : undefined}
                          >
                            {hasData && (
                              <span
                                className="absolute top-0 left-0 bottom-0 rounded-tl-[4px] rounded-bl-[4px]"
                                style={{ width: 3, background: fillColor }}
                              />
                            )}
                            <span
                              className="text-[12px] font-medium leading-none"
                              style={{ color: hasData ? 'var(--mw-text-primary)' : 'var(--mw-text-muted)' }}
                            >
                              {String(day.getDate()).padStart(2, '0')}
                            </span>
                            {tipOpen && (
                              <div
                                className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] z-10
                                            px-2 py-1 rounded-md text-white text-[12px] font-medium
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
    </div>
  )
}

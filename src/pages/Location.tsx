import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import { ChevronLeft, ChevronDown, MapPin, CalendarDays, List } from 'lucide-react'
import { getLocationBySlug } from '@/data/locations'
import { useRainfallData } from '@/hooks/useRainfallData'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import { ShareButton } from '@/components/ShareButton'
import { SortButton } from '@/components/SortButton'
import { LocationSortSheet, type LocationSortMode } from '@/components/LocationSortSheet'
import { LocationSwitcherSheet } from '@/components/LocationSwitcherSheet'
import { SelectedDateCard } from '@/components/SelectedDateCard'
import {
  groupByDate,
  sumForLocation,
  startOfDay,
  formatShortDate,
  formatMonth,
  getRainfallStatus,
  getCalendarWeekRange,
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


export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const routerState = (useRouterLocation().state as { date?: string; tab?: string; weekStart?: string; weekEnd?: string } | null)
  const location = getLocationBySlug(slug ?? '')
  const { data: records = [] } = useRainfallData()

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    routerState?.date ? startOfDay(new Date(routerState.date)) : startOfDay(new Date())
  )
  const [view, setView] = useState<'list' | 'month'>('list')
  const [sortMode, setSortMode] = useState<LocationSortMode>('date-desc')
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [locationSwitcherOpen, setLocationSwitcherOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )
  const [visibleDate, setVisibleDate] = useState<Date>(selectedDate)
  const [cardPhase, setCardPhase] = useState<'idle' | 'leaving' | 'entering'>('idle')
  const [isWeekMode, setIsWeekMode] = useState(() => routerState?.tab === 'week')
  const [weekModeStart] = useState<Date | null>(() =>
    routerState?.weekStart ? new Date(routerState.weekStart) : null
  )
  const [weekModeEnd] = useState<Date | null>(() =>
    routerState?.weekEnd ? new Date(routerState.weekEnd) : null
  )
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const switchingToSlugRef = useRef<string | null>(null)

  // Save tab context for back-navigation restoration in Home
  useEffect(() => {
    try {
      sessionStorage.setItem('mazha_home_tab', routerState?.tab === 'week' ? 'week' : 'day')
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('mazha_home_selectedDate', selectedDate.toISOString())
    } catch {}
  }, [selectedDate])

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      setShowStickyHeader(heroRef.current.getBoundingClientRect().bottom <= 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!switchingToSlugRef.current) return
    switchingToSlugRef.current = null

    const now = startOfDay(new Date())
    setSelectedDate(now)
    setVisibleDate(now)
    setSelectedMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setIsWeekMode(false)
    setCardPhase('idle')
    setShowStickyHeader(false)
    window.scrollTo(0, 0)

    setContentVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

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

  // Header card stats — computed from visibleDate (trails selectedDate during animation)
  const selectedDayMm = sumForLocation(records, location.name, visibleDate, visibleDate)
  const { start: weekStart, end: weekEnd } = getCalendarWeekRange(visibleDate)
  const weekMm = (isWeekMode && weekModeStart && weekModeEnd)
    ? sumForLocation(records, location.name, weekModeStart, weekModeEnd)
    : sumForLocation(records, location.name, weekStart, weekEnd)
  const alertStatus = isWeekMode
    ? getRainfallStatus(weekMm, 'week')
    : getRainfallStatus(selectedDayMm)

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
  }, [allHistory]) // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const isCurrentMonth = selectedMonth >= currentMonthStart

  const rainyDaySet = new Set(allHistory.map(r => startOfDay(r.date).toISOString()))
  const dataByDate = new Map(allHistory.map(r => [startOfDay(r.date).toISOString(), r.mm]))

  function prevMonth() {
    setSelectedMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }
  function nextMonth() {
    setSelectedMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }

  function handleCardAnimEnd() {
    if (cardPhase === 'leaving') {
      setVisibleDate(selectedDate)
      setIsWeekMode(false)
      setCardPhase('entering')
    } else {
      setCardPhase('idle')
    }
  }

  function handleDateRowClick(date: Date) {
    const d = startOfDay(date)
    setSelectedDate(d)
    setSelectedMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    try { sessionStorage.setItem('mazha_home_tab', 'day') } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })

    observerRef.current?.disconnect()
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          observerRef.current = null
          setCardPhase('leaving')
        }
      },
      { threshold: 0.5 },
    )
    observerRef.current = observer
    observer.observe(cardRef.current)
  }

  function handleBack() {
    setIsExiting(true)
  }

  function handleLocationSwitch(newSlug: string) {
    setLocationSwitcherOpen(false)
    if (newSlug === slug) return
    switchingToSlugRef.current = newSlug
    setContentVisible(false)
  }

  function handleContentFadeEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== 'opacity') return
    if (!contentVisible && switchingToSlugRef.current) {
      navigate(`/location/${switchingToSlugRef.current}`, {
        replace: true,
        state: { date: selectedDate.toISOString() },
      })
    }
  }

  const calendarDays = getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth())
  const firstDayOffset = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()

  const shareEntries = allHistory.map(r => ({
    location: formatShortDate(r.date),
    rainfallMm: r.mm,
  }))

  return (
    <div
      className="min-h-screen overflow-x-hidden pb-8"
      style={{
        background: 'var(--color-background, white)',
        animation: isExiting
          ? 'slide-out-to-right 280ms ease-in forwards'
          : 'slide-in-from-right 280ms ease-out forwards',
        willChange: 'transform',
      }}
      onAnimationEnd={() => { if (isExiting) navigate(-1) }}
    >

      {/* Top nav */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          className="flex items-center gap-2 min-h-[48px]"
          onClick={handleBack}
          aria-label="Back"
        >
          <ChevronLeft size={18} style={{ color: 'var(--mw-text-primary)' }} />
          <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>Back</span>
        </button>
      </div>

      {/* Sticky Header */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 h-[60px]"
        style={{
          background: 'var(--color-background, white)',
          borderBottom: '1px solid var(--mw-border)',
          transform: showStickyHeader ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showStickyHeader ? 1 : 0,
          transition: 'transform 250ms ease, opacity 250ms ease',
          pointerEvents: showStickyHeader ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center" style={{ gap: 4 }}>
          <MapPin size={18} style={{ color: 'var(--mw-text-primary)', flexShrink: 0 }} />
          <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>
            {location.name}
          </span>
        </div>
      </div>

      <div
        className="flex flex-col gap-7 px-5"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: 'opacity 200ms ease',
          pointerEvents: contentVisible ? 'auto' : 'none',
        }}
        onTransitionEnd={handleContentFadeEnd}
      >

        {/* Location Hero */}
        <div ref={heroRef} className="flex flex-col gap-2">

          {/* Selected Location Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={24} style={{ color: 'var(--mw-text-primary)', flexShrink: 0 }} />
              <span className="text-[26px] font-normal leading-none" style={{ color: 'var(--mw-text-primary)' }}>
                {location.name}
              </span>
            </div>
            <button
              onClick={() => setLocationSwitcherOpen(true)}
              className="flex items-center justify-center min-h-[48px] min-w-[48px]"
              aria-label="Switch location"
            >
              <span
                className="flex items-center justify-center"
                style={{
                  background: 'var(--mw-surface)',
                  border: '1px solid var(--mw-border)',
                  paddingLeft: 6,
                  paddingRight: 6,
                  paddingTop: 9,
                  paddingBottom: 9,
                }}
              >
                <ChevronDown size={12} style={{ color: 'var(--mw-text-primary)' }} />
              </span>
            </button>
          </div>

          {/* Selected Date Header card */}
          <SelectedDateCard
            date={visibleDate}
            rainfallMm={selectedDayMm}
            weekMm={weekMm}
            alertStatus={alertStatus}
            cardRef={cardRef}
            onAnimationEnd={handleCardAnimEnd}
            cardPhase={cardPhase}
            weekMode={isWeekMode}
            weekRangeStart={weekModeStart ?? undefined}
            weekRangeEnd={weekModeEnd ?? undefined}
          />
        </div>

        {/* Monthly History section divider */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px" style={{ background: 'var(--mw-border)' }} />
          <span
            className="text-[14px] font-semibold leading-none shrink-0"
            style={{ color: 'var(--mw-text-primary)' }}
          >
            Monthly History
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--mw-border)' }} />
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

            <div style={{ opacity: view === 'month' ? 0.5 : 1, pointerEvents: view === 'month' ? 'none' : 'auto' }}>
              <SortButton onClick={() => setSortSheetOpen(true)} iconOnly />
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
                sortedHistory.map(row => {
                  const iso = startOfDay(row.date).toISOString()
                  const isSelected = selectedDate.toISOString() === iso
                  return (
                    <StationRow
                      key={iso}
                      label={formatShortDate(row.date)}
                      rainfallMm={row.mm}
                      maxMm={MAX_MM}
                      blueShade={blueShadeMap.get(iso)}
                      highlighted={isSelected}
                      onClick={() => handleDateRowClick(row.date)}
                    />
                  )
                })
              )}
            </ul>

            <ShareButton entries={shareEntries} date={selectedMonth} />
          </>
        )}

        {/* ── MONTH VIEW ── */}
        {view === 'month' && (
          <>
            <div className="overflow-x-clip">
              <div
                className="rounded-lg flex flex-col gap-3"
                style={{ background: 'var(--mw-surface)', padding: 10 }}
              >
                <div className="flex gap-2 opacity-70">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="flex-1 flex items-center justify-center" style={{ padding: 4 }}>
                      <span className="text-[12px] font-normal leading-none" style={{ color: 'var(--mw-text-muted)' }}>
                        {d}
                      </span>
                    </div>
                  ))}
                </div>

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
                        const isSelected = selectedDate.toISOString() === iso
                        return (
                          <div
                            key={ci}
                            className="flex-1 relative flex items-center justify-center overflow-visible"
                            style={{
                              height: 38,
                              padding: 4,
                              border: isSelected ? '1.5px solid var(--mw-progress-fill)' : '1px solid var(--mw-border)',
                              borderRadius: 4,
                            }}
                            onClick={hasData ? () => handleDateRowClick(day) : undefined}
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

      <LocationSwitcherSheet
        open={locationSwitcherOpen}
        currentSlug={slug ?? ''}
        onClose={() => setLocationSwitcherOpen(false)}
        onSelect={handleLocationSwitch}
      />
    </div>
  )
}

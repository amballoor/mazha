import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownNarrowWide } from 'lucide-react'
import { useRainfallData } from '@/hooks/useRainfallData'
import { LOCATIONS } from '@/data/locations'
import { HeaderCard } from '@/components/HeaderCard'
import { TabStrip } from '@/components/TabStrip'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import {
  filterByDay,
  filterByDateRange,
  getWeekRange,
  getMostRecentDate,
  startOfDay,
  formatDay,
  formatWeekRange,
} from '@/lib/rainfallUtils'

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
  const { data: records = [], isLoading } = useRainfallData()

  const [tab, setTab] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = startOfDay(new Date())
  // Once data loads, default to the most recent date in the dataset
  const mostRecent = records.length > 0 ? getMostRecentDate(records) : today
  const displayDate = selectedDate ?? mostRecent

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

  const { start: weekStart, end: weekEnd } = getWeekRange(displayDate)

  const dateLabel =
    tab === 'day'
      ? formatDay(displayDate)
      : formatWeekRange(weekStart, weekEnd)

  const isNextDisabled =
    tab === 'day'
      ? displayDate >= today
      : displayDate >= today

  // Compute rainfall mm per location for the selected period
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

  const maxMm = Math.max(...locationValues.map((v) => v.mm), 1)

  return (
    <div
      className="min-h-screen px-5 pt-5 pb-6"
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
          <div className="flex items-center justify-between">
            <DateNav
              label={dateLabel}
              onPrev={tab === 'day' ? prevDay : prevWeek}
              onNext={tab === 'day' ? nextDay : nextWeek}
              disableNext={isNextDisabled}
              selectedDate={displayDate}
              onDateSelect={setSelectedDate}
              maxDate={today}
            />
            <ArrowDownNarrowWide size={24} style={{ color: 'var(--mw-text-muted)' }} />
          </div>

          <ul className="flex flex-col gap-2">
            {isLoading
              ? LOCATIONS.map((loc) => <SkeletonRow key={loc.slug} />)
              : locationValues.map(({ loc, mm }) => (
                  <StationRow
                    key={loc.slug}
                    label={loc.name}
                    rainfallMm={mm}
                    maxMm={maxMm}
                    onClick={() => navigate(`/location/${loc.slug}`)}
                  />
                ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

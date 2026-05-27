import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getLocationBySlug } from '@/data/locations'
import { useRainfallData } from '@/hooks/useRainfallData'
import { DateNav } from '@/components/DateNav'
import { StationRow } from '@/components/StationRow'
import {
  groupByDate,
  sumForLocation,
  startOfDay,
  formatShortDate,
  formatMonth,
} from '@/lib/rainfallUtils'

const ROWS_PER_PAGE = 7

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
  const location = getLocationBySlug(slug ?? '')
  const { data: records = [] } = useRainfallData()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1))
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_PAGE)

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

  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)

  const yesterdayMm = sumForLocation(records, location.name, yesterday, yesterday)
  const weekMm = sumForLocation(records, location.name, weekAgo, today)

  const yesterdayLabel = `Yesterday (${formatShortDate(yesterday)})`

  // All dates for this location in the selected month, sorted newest first
  const allHistory = groupByDate(records, location.name).filter((row) => {
    return (
      row.date.getFullYear() === selectedMonth.getFullYear() &&
      row.date.getMonth() === selectedMonth.getMonth()
    )
  })

  const maxMm = Math.max(...allHistory.map((r) => r.mm), 1)
  const visibleHistory = allHistory.slice(0, visibleCount)
  const hasMore = visibleCount < allHistory.length

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const isCurrentMonth = selectedMonth >= currentMonthStart

  function prevMonth() {
    setSelectedMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    setVisibleCount(ROWS_PER_PAGE)
  }
  function nextMonth() {
    setSelectedMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    setVisibleCount(ROWS_PER_PAGE)
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--color-background, white)' }}>
      {/* Top nav */}
      <div
        className="flex items-center justify-between px-5 py-6"
        style={{ background: 'var(--color-background, white)' }}
      >
        <button
          className="flex items-center gap-2 min-h-[48px] min-w-[48px]"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={18} style={{ color: 'var(--mw-text-primary)' }} />
          <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>
            Back
          </span>
        </button>
      </div>

      {/* Hero card */}
      <div className="mx-5">
        <div
          className="flex flex-col gap-4 p-5 rounded-xl"
          style={{
            background: 'var(--mw-surface)',
            border: '1px solid var(--mw-border)',
          }}
        >
          <p
            className="text-[26px] font-normal leading-tight w-full"
            style={{ color: 'var(--mw-text-primary)' }}
          >
            {location.name}
          </p>
          <div className="flex items-start justify-between overflow-hidden whitespace-nowrap">
            <StatBlock label={yesterdayLabel} value={`${yesterdayMm.toFixed(1)} mm`} />
            <StatBlock label="This Week Overall" value={`${weekMm.toFixed(1)} mm`} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mt-4 mx-0" style={{ background: 'var(--mw-border)' }} />

      {/* Section header */}
      <div className="flex items-center justify-between px-5 mt-[14px]">
        <span className="text-[18px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>
          Rainfall History
        </span>
        <DateNav
          label={formatMonth(selectedMonth)}
          onPrev={prevMonth}
          onNext={nextMonth}
          disableNext={isCurrentMonth}
        />
      </div>

      {/* History list */}
      <ul className="flex flex-col gap-2 px-5 mt-[18px]">
        {visibleHistory.length === 0 ? (
          <li className="text-[16px] py-4" style={{ color: 'var(--mw-text-muted)' }}>
            No data for this month.
          </li>
        ) : (
          visibleHistory.map((row) => (
            <StationRow
              key={row.date.toISOString()}
              label={formatShortDate(row.date)}
              rainfallMm={row.mm}
              maxMm={maxMm}
            />
          ))
        )}
      </ul>

      {/* Show previous dates button */}
      {hasMore && (
        <div className="px-5 mt-4">
          <button
            className="flex items-center justify-center w-full h-[52px] rounded-lg text-[16px] font-medium"
            style={{ background: 'var(--mw-text-primary)', color: '#ffffff' }}
            onClick={() => setVisibleCount((c) => c + ROWS_PER_PAGE)}
          >
            Show Previous Dates
          </button>
        </div>
      )}
    </div>
  )
}

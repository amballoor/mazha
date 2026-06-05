import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarSheet } from '@/components/CalendarSheet'

type DateNavProps = {
  label: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
  disablePrev?: boolean
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  showRainOnly?: boolean
  onToggleRainOnly?: () => void
  calendarMode?: 'day' | 'month'
}

export function DateNav({
  label,
  onPrev,
  onNext,
  disableNext,
  disablePrev,
  selectedDate,
  onDateSelect,
  maxDate,
  disabledDates,
  showRainOnly = false,
  onToggleRainOnly,
  calendarMode = 'day',
}: DateNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="flex items-center justify-between h-[42px] px-5 rounded-lg w-full"
        style={{ border: '1px solid var(--mw-border)' }}
      >
        <button
          className="flex items-center justify-center size-[32px] shrink-0"
          onClick={onPrev}
          disabled={disablePrev}
          aria-label="Previous"
          style={{ opacity: disablePrev ? 0.4 : 1 }}
        >
          <ChevronLeft size={32} style={{ color: 'var(--mw-progress-fill)' }} />
        </button>

        {onDateSelect ? (
          <button
            className="text-[16px] font-medium leading-none whitespace-nowrap px-1 cursor-pointer"
            style={{ color: 'var(--mw-progress-fill)', background: 'none', border: 'none' }}
            onClick={() => setOpen(true)}
          >
            {label}
          </button>
        ) : (
          <span
            className="text-[16px] font-medium leading-none whitespace-nowrap"
            style={{ color: 'var(--mw-progress-fill)' }}
          >
            {label}
          </span>
        )}

        <button
          className="flex items-center justify-center size-[32px] shrink-0"
          onClick={onNext}
          disabled={disableNext}
          aria-label="Next"
          style={{ opacity: disableNext ? 0.4 : 1 }}
        >
          <ChevronRight size={32} style={{ color: 'var(--mw-progress-fill)' }} />
        </button>
      </div>

      {onDateSelect && (
        <CalendarSheet
          open={open}
          onClose={() => setOpen(false)}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          maxDate={maxDate}
          disabledDates={disabledDates}
          showRainOnly={showRainOnly}
          onToggleRainOnly={onToggleRainOnly ?? (() => {})}
          mode={calendarMode}
        />
      )}
    </>
  )
}

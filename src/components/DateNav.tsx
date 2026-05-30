import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarSheet } from '@/components/CalendarSheet'

type DateNavProps = {
  label: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  showRainOnly?: boolean
  onToggleRainOnly?: () => void
}

export function DateNav({
  label,
  onPrev,
  onNext,
  disableNext,
  selectedDate,
  onDateSelect,
  maxDate,
  disabledDates,
  showRainOnly = false,
  onToggleRainOnly,
}: DateNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="flex items-center gap-2 h-[42px] px-2 rounded-lg shrink-0"
        style={{ border: '1px solid var(--mw-border)' }}
      >
        <button
          className="flex items-center justify-center size-[18px] shrink-0"
          onClick={onPrev}
          aria-label="Previous"
        >
          <ChevronLeft size={18} style={{ color: 'var(--mw-text-primary)' }} />
        </button>

        {onDateSelect ? (
          <button
            className="text-[16px] font-medium leading-none whitespace-nowrap px-1 cursor-pointer"
            style={{ color: 'var(--mw-text-primary)', background: 'none', border: 'none' }}
            onClick={() => setOpen(true)}
          >
            {label}
          </button>
        ) : (
          <span
            className="text-[16px] font-medium leading-none whitespace-nowrap"
            style={{ color: 'var(--mw-text-primary)' }}
          >
            {label}
          </span>
        )}

        <button
          className="flex items-center justify-center size-[18px] shrink-0"
          onClick={onNext}
          disabled={disableNext}
          aria-label="Next"
          style={{ opacity: disableNext ? 0.4 : 1 }}
        >
          <ChevronRight size={18} style={{ color: 'var(--mw-text-primary)' }} />
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
        />
      )}
    </>
  )
}

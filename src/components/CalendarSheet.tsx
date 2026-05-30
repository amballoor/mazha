import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { FilterChip } from '@/components/FilterChip'

type CalendarSheetProps = {
  open: boolean
  onClose: () => void
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  showRainOnly: boolean
  onToggleRainOnly: () => void
}

export function CalendarSheet({
  open,
  onClose,
  selectedDate,
  onDateSelect,
  maxDate,
  disabledDates,
  showRainOnly,
  onToggleRainOnly,
}: CalendarSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease-in',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-4 pb-8"
        style={{
          background: 'var(--color-background, white)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-in',
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--mw-border)' }} />

        {/* Calendar */}
        <div
          className="flex justify-center [&_button]:font-medium"
          style={{ '--primary': '#4aa2d1', '--primary-foreground': '#ffffff' } as React.CSSProperties}
        >
          <Calendar
            mode="single"
            showOutsideDays={false}
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateSelect(date)
                onClose()
              }
            }}
            disabled={(date) =>
              (maxDate ? date > maxDate : false) ||
              (disabledDates ? disabledDates(date) : false)
            }
            defaultMonth={selectedDate}
            className="[--cell-size:56px] p-4"
            classNames={{
              caption_label: 'text-base font-medium select-none',
              weekday: 'flex-1 rounded-md text-base font-normal text-muted-foreground select-none',
            }}
            components={{
              Chevron: ({ orientation }) => {
                const Icon = orientation === 'left' ? ChevronLeft
                  : orientation === 'right' ? ChevronRight
                  : ChevronDown
                return <Icon size={32} strokeWidth={2} />
              },
            }}
          />
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-4">
          <FilterChip
            active={showRainOnly}
            onToggle={onToggleRainOnly}
            className="flex-1 justify-center"
          />
          <button
            onClick={onClose}
            className="flex items-center gap-2 h-[46px] px-3 py-2 rounded-lg text-[16px] leading-none shrink-0 transition-colors"
            style={{
              border: '1px solid var(--mw-status-heavy-rain)',
              color: 'var(--mw-status-heavy-rain)',
              background: 'transparent',
            }}
          >
            <X size={18} />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

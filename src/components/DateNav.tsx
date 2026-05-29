import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

type DateNavProps = {
  label: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  maxDate?: Date
}

export function DateNav({ label, onPrev, onNext, disableNext, selectedDate, onDateSelect, maxDate }: DateNavProps) {
  const [open, setOpen] = useState(false)

  return (
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="text-[16px] font-medium leading-none whitespace-nowrap px-1"
              style={{ color: 'var(--mw-text-primary)' }}
            >
              {label}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            className="w-auto p-0 rounded-xl shadow-md"
            style={{
              background: 'var(--mw-surface)',
              border: '1px solid var(--mw-border)',
            }}
          >
            {/* Override --primary so the selected day uses the Mazha blue */}
            <div style={{ '--primary': '#4aa2d1', '--primary-foreground': '#ffffff' } as React.CSSProperties}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateSelect(date)
                    setOpen(false)
                  }
                }}
                disabled={maxDate ? { after: maxDate } : undefined}
                defaultMonth={selectedDate}
              />
            </div>
          </PopoverContent>
        </Popover>
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
  )
}

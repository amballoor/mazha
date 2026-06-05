import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { FilterChip } from '@/components/FilterChip'

function TablerChevron({ direction, size = 42, style }: {
  direction: 'left' | 'right' | 'down'
  size?: number
  style?: React.CSSProperties
}) {
  const path =
    direction === 'left'  ? 'M15 6l-6 6l6 6' :
    direction === 'right' ? 'M9 6l6 6l-6 6'  :
                            'M6 9l6 6l6-6'
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={path} />
    </svg>
  )
}

const MIN_YEAR = 2020
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type View = 'day' | 'month' | 'year'

type CalendarSheetProps = {
  open: boolean
  onClose: () => void
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  showRainOnly?: boolean
  onToggleRainOnly?: () => void
  mode?: 'day' | 'month'
}

export function CalendarSheet({
  open,
  onClose,
  selectedDate,
  onDateSelect,
  maxDate,
  disabledDates,
  showRainOnly = false,
  onToggleRainOnly,
  mode = 'day',
}: CalendarSheetProps) {
  const today = new Date()
  const [view, setView] = useState<View>(mode === 'month' ? 'month' : 'day')
  const [navMonth, setNavMonth] = useState<Date>(selectedDate ?? today)
  const [viewYear, setViewYear] = useState<number>((selectedDate ?? today).getFullYear())

  // Reset view when sheet closes
  useEffect(() => {
    if (!open) setView(mode === 'month' ? 'month' : 'day')
  }, [open, mode])

  // Sync navMonth when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) setNavMonth(selectedDate)
  }, [selectedDate])

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const effectiveMaxDate = maxDate ?? today

  const isFutureMonth = (year: number, monthIdx: number) =>
    year > today.getFullYear() ||
    (year === today.getFullYear() && monthIdx > today.getMonth())

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{ opacity: open ? 1 : 0, transition: 'opacity 200ms ease-in' }}
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

        {/* Views — fixed min-height matches 6-week grid */}
        <div className="min-h-[376px]">

          {/* ── Day view ── */}
          {view === 'day' && (
            <div
              className="flex justify-center [&_button]:font-medium"
              style={{ '--primary': '#4aa2d1', '--primary-foreground': '#ffffff' } as React.CSSProperties}
            >
              <Calendar
                mode="single"
                fixedWeeks
                showOutsideDays={false}
                selected={selectedDate}
                month={navMonth}
                onMonthChange={setNavMonth}
                endMonth={effectiveMaxDate}
                onSelect={(date) => {
                  if (date) { onDateSelect(date); onClose() }
                }}
                disabled={(date) =>
                  (maxDate ? date > maxDate : false) ||
                  (disabledDates ? disabledDates(date) : false)
                }
                className="[--cell-size:56px] p-4"
                classNames={{
                  caption_label: 'text-base font-medium select-none',
                  weekday: 'flex-1 rounded-md text-base font-normal text-muted-foreground select-none',
                  nav:             'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pointer-events-none',
                  button_previous: 'size-[42px] p-0 select-none aria-disabled:opacity-40 flex items-center justify-center rounded-lg bg-transparent border-0 shadow-none hover:bg-transparent pointer-events-auto',
                  button_next:     'size-[42px] p-0 select-none aria-disabled:opacity-40 flex items-center justify-center rounded-lg bg-transparent border-0 shadow-none hover:bg-transparent pointer-events-auto',
                }}
                components={{
                  MonthCaption: ({ calendarMonth }) => (
                    <div className="flex h-[56px] w-full items-center justify-center px-[56px]">
                      <button
                        className="text-base font-medium px-2 py-1 rounded-lg"
                        style={{ color: 'var(--mw-progress-fill)', background: 'none', border: 'none' }}
                        onClick={() => {
                          setViewYear(calendarMonth.date.getFullYear())
                          setView('month')
                        }}
                      >
                        {MONTH_FULL[calendarMonth.date.getMonth()]} {calendarMonth.date.getFullYear()}
                      </button>
                    </div>
                  ),
                  Chevron: ({ orientation }) => (
                    <TablerChevron
                      direction={orientation === 'left' ? 'left' : orientation === 'right' ? 'right' : 'down'}
                      size={42}
                      style={{ color: 'var(--mw-progress-fill)' }}
                    />
                  ),
                }}
              />
            </div>
          )}

          {/* ── Month picker view ── */}
          {view === 'month' && (
            <div className="p-4">
              {/* Header: prev-year · year (clickable) · next-year */}
              <div className="flex items-center justify-between h-[42px] mb-4">
                <button
                  className="size-[42px] flex items-center justify-center bg-transparent border-0"
                  onClick={() => setViewYear(y => y - 1)}
                  disabled={viewYear <= MIN_YEAR}
                  aria-label="Previous year"
                  style={{ color: 'var(--mw-progress-fill)', opacity: viewYear <= MIN_YEAR ? 0.4 : 1 }}
                >
                  <TablerChevron direction="left" size={42} />
                </button>

                <button
                  className="text-base font-semibold px-2 py-1 rounded-lg"
                  style={{ color: 'var(--mw-progress-fill)', background: 'none', border: 'none' }}
                  onClick={() => setView('year')}
                >
                  {viewYear}
                </button>

                <button
                  className="size-[42px] flex items-center justify-center bg-transparent border-0"
                  onClick={() => setViewYear(y => y + 1)}
                  disabled={viewYear >= today.getFullYear()}
                  aria-label="Next year"
                  style={{ color: 'var(--mw-progress-fill)', opacity: viewYear >= today.getFullYear() ? 0.4 : 1 }}
                >
                  <TablerChevron direction="right" size={42} />
                </button>
              </div>

              {/* 4-column month grid */}
              <div className="grid grid-cols-4 gap-2">
                {MONTH_SHORT.map((name, idx) => {
                  const disabled = isFutureMonth(viewYear, idx)
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === idx
                  return (
                    <button
                      key={name}
                      disabled={disabled}
                      onClick={() => {
                        if (mode === 'month') {
                          onDateSelect(new Date(viewYear, idx, 1))
                          onClose()
                        } else {
                          setNavMonth(new Date(viewYear, idx, 1))
                          setView('day')
                        }
                      }}
                      className="h-[56px] rounded-xl text-base font-medium transition-colors"
                      style={{
                        background: isSelected ? 'var(--mw-progress-fill)' : 'transparent',
                        color: isSelected ? '#fff' : disabled ? 'var(--mw-text-muted, #aaa)' : 'inherit',
                        opacity: disabled ? 0.4 : 1,
                        border: 'none',
                        cursor: disabled ? 'default' : 'pointer',
                      }}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Year picker view ── */}
          {view === 'year' && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-center h-[42px] mb-4">
                <span className="text-base font-semibold" style={{ color: 'var(--mw-progress-fill)' }}>
                  Select Year
                </span>
              </div>

              {/* 3-column year grid, newest first */}
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[290px]">
                {Array.from(
                  { length: today.getFullYear() - MIN_YEAR + 1 },
                  (_, i) => today.getFullYear() - i
                ).map((year) => {
                  const isSelected = selectedDate?.getFullYear() === year
                  return (
                    <button
                      key={year}
                      onClick={() => { setViewYear(year); setView('month') }}
                      className="h-[56px] rounded-xl text-base font-medium transition-colors"
                      style={{
                        background: isSelected ? 'var(--mw-progress-fill)' : 'transparent',
                        color: isSelected ? '#fff' : 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-4">
          {mode === 'day' && (
            <FilterChip
              active={showRainOnly}
              onToggle={onToggleRainOnly ?? (() => {})}
              className="flex-1 justify-center"
            />
          )}
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

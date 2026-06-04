import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { SortMode } from '@/types/rainfall'

const OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'high-to-low', label: 'Highest to lowest rainfall' },
  { value: 'low-to-high', label: 'Lowest to highest rainfall' },
  { value: 'alpha',       label: 'Alphabetical location order' },
]

type SortSheetProps = {
  open: boolean
  onClose: () => void
  value: SortMode
  onSelect: (mode: SortMode) => void
}

export function SortSheet({ open, onClose, value, onSelect }: SortSheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
        style={{
          background: 'var(--color-background, white)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-in',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--mw-border)' }} />
        </div>

        {/* Title */}
        <div
          className="flex items-center justify-center h-[52px] px-5"
          style={{ borderBottom: '1px solid var(--mw-border)' }}
        >
          <span
            className="text-[16px] font-medium leading-none"
            style={{ color: 'var(--mw-text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            Sort
          </span>
        </div>

        {/* Options */}
        {OPTIONS.map((opt, i) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="flex items-center justify-between w-full px-5"
              style={{ paddingTop: i === 0 ? 28 : 20, paddingBottom: 20 }}
            >
              <span
                className="text-[18px] leading-none"
                style={{ color: 'var(--mw-text-primary)', fontFamily: 'var(--font-sans)' }}
              >
                {opt.label}
              </span>

              {/* Radio */}
              <span
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  background: selected ? 'var(--mw-progress-fill)' : 'transparent',
                  border: selected
                    ? '2px solid var(--mw-progress-fill)'
                    : '2px solid var(--mw-progress-fill)',
                }}
              >
                {selected && (
                  <span
                    className="rounded-full"
                    style={{ width: 8, height: 8, background: 'white' }}
                  />
                )}
              </span>
            </button>
          )
        })}

        {/* Safe-area bottom padding */}
        <div style={{ height: 36 }} />
      </div>
    </div>,
    document.body,
  )
}

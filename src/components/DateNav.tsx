import { ChevronLeft, ChevronRight } from 'lucide-react'

type DateNavProps = {
  label: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
}

export function DateNav({ label, onPrev, onNext, disableNext }: DateNavProps) {
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
      <span
        className="text-[16px] font-medium leading-none whitespace-nowrap"
        style={{ color: 'var(--mw-text-primary)' }}
      >
        {label}
      </span>
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

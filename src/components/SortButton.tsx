import { ArrowDownNarrowWide } from 'lucide-react'

type SortButtonProps = {
  active: boolean
  onToggle: () => void
}

export function SortButton({ active, onToggle }: SortButtonProps) {
  return (
    <button
      aria-pressed={active}
      aria-label="Sort by rainfall"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg shrink-0 px-[7px] py-[7px] transition-colors"
      style={
        active
          ? {
              border: '1px solid var(--mw-progress-fill)',
              background: 'rgba(74,162,209,0.05)',
            }
          : {
              border: '1px solid var(--mw-text-muted)',
              background: 'transparent',
            }
      }
    >
      <span
        className="text-[14px] leading-none whitespace-nowrap"
        style={{ color: active ? 'var(--mw-progress-fill)' : 'var(--mw-text-muted)' }}
      >
        Sort
      </span>
      <ArrowDownNarrowWide size={24} style={{ color: active ? 'var(--mw-progress-fill)' : 'var(--mw-text-muted)' }} />
    </button>
  )
}

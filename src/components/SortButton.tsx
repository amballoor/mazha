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
      className="flex items-center justify-center size-[38px] rounded-lg shrink-0 transition-colors"
      style={
        active
          ? {
              border: '1px solid var(--mw-progress-fill)',
              background: 'rgba(74,162,209,0.05)',
              color: 'var(--mw-progress-fill)',
            }
          : {
              border: '1px solid var(--mw-progress-fill)',
              background: 'transparent',
              color: 'var(--mw-text-muted)',
            }
      }
    >
      <ArrowDownNarrowWide size={24} />
    </button>
  )
}

import { CloudRain } from 'lucide-react'

type FilterChipProps = {
  active: boolean
  onToggle: () => void
}

export function FilterChip({ active, onToggle }: FilterChipProps) {
  return (
    <button
      aria-pressed={active}
      onClick={onToggle}
      className="flex items-center gap-2 h-[38px] px-2 rounded-lg shrink-0 transition-colors"
      style={
        active
          ? {
              border: '1px solid var(--mw-progress-fill)',
              color: 'var(--mw-progress-fill)',
              background: 'rgba(74,162,209,0.05)',
            }
          : {
              border: '1px solid var(--mw-border)',
              color: 'var(--mw-text-muted)',
              background: 'transparent',
            }
      }
    >
      <span className="text-[14px] leading-none whitespace-nowrap">Show only</span>
      <CloudRain size={14} />
    </button>
  )
}

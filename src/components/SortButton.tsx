import { ArrowDownNarrowWide } from 'lucide-react'

type SortButtonProps = {
  onClick: () => void
}

export function SortButton({ onClick }: SortButtonProps) {
  return (
    <button
      aria-label="Sort options"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg shrink-0 px-[7px] py-[7px]"
      style={{
        border: '1px solid var(--mw-progress-fill)',
        background: 'rgba(74,162,209,0.05)',
      }}
    >
      <span
        className="text-[14px] leading-none whitespace-nowrap"
        style={{ color: 'var(--mw-progress-fill)' }}
      >
        Sort
      </span>
      <ArrowDownNarrowWide size={24} style={{ color: 'var(--mw-progress-fill)' }} />
    </button>
  )
}

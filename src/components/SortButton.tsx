import { ArrowUpDown } from 'lucide-react'

type SortButtonProps = {
  onClick: () => void
  iconOnly?: boolean
}

export function SortButton({ onClick, iconOnly = false }: SortButtonProps) {
  return (
    <button
      aria-label="Sort options"
      onClick={onClick}
      className={`flex items-center justify-center h-[42px] rounded-[8px] shrink-0 px-3 py-2${!iconOnly ? ' gap-2' : ''}`}
      style={{ border: '1px solid var(--mw-progress-fill)', background: '#f9fcfd' }}
    >
      {!iconOnly && (
        <span className="text-[14px] font-normal leading-none whitespace-nowrap" style={{ color: 'var(--mw-progress-fill)' }}>
          Sort
        </span>
      )}
      <ArrowUpDown size={24} style={{ color: 'var(--mw-progress-fill)' }} />
    </button>
  )
}

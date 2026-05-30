function Toggle({ active }: { active: boolean }) {
  return (
    <div className="relative shrink-0 size-[46px]">
      {/* Track */}
      <div
        className="absolute rounded-full"
        style={{
          width: 38,
          height: 23,
          left: 4,
          top: 11.5,
          background: active ? 'var(--mw-progress-fill)' : 'var(--mw-text-muted)',
          transition: 'background 200ms ease',
        }}
      />
      {/* Thumb */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: 12,
          height: 12,
          left: active ? 26 : 9.5,
          top: 17,
          transition: 'left 200ms ease',
        }}
      />
    </div>
  )
}

type FilterChipProps = {
  active: boolean
  onToggle: () => void
  className?: string
}

export function FilterChip({ active, onToggle, className }: FilterChipProps) {
  return (
    <button
      aria-pressed={active}
      onClick={onToggle}
      className={`flex items-center gap-2 h-[46px] px-5 rounded-lg shrink-0 transition-colors ${className ?? ''}`}
      style={
        active
          ? {
              border: '1px solid var(--mw-progress-fill)',
              color: 'var(--mw-progress-fill)',
              background: '#f9fcfd',
            }
          : {
              border: '1px solid var(--mw-progress-fill)',
              color: 'var(--mw-text-muted)',
              background: 'transparent',
            }
      }
    >
      <span className="text-[16px] leading-none whitespace-nowrap">Show only rainy days</span>
      <Toggle active={active} />
    </button>
  )
}

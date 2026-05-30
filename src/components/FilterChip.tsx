function Toggle({ active }: { active: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
      {/* Track */}
      <div
        className="absolute rounded-full"
        style={{
          width: 26.67,
          height: 16,
          left: 2.67,
          top: 8,
          background: active ? 'var(--mw-progress-fill)' : 'var(--mw-text-muted)',
          transition: 'background 200ms ease',
        }}
      />
      {/* Thumb */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: 8.25,
          height: 8.25,
          left: active ? 18.18 : 6.55,
          top: 11.88,
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
      className={`flex items-center gap-2 h-[38px] px-[12px] rounded-lg shrink-0 transition-colors ${className ?? ''}`}
      style={
        active
          ? {
              border: '1px solid var(--mw-progress-fill)',
              color: 'var(--mw-progress-fill)',
              background: 'rgba(74,162,209,0.05)',
            }
          : {
              border: '1px solid var(--mw-progress-fill)',
              color: 'var(--mw-text-muted)',
              background: 'transparent',
            }
      }
    >
      <span className="text-[14px] leading-none whitespace-nowrap">Show only rainy days</span>
      <Toggle active={active} />
    </button>
  )
}

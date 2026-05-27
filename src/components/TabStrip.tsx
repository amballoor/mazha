type TabStripProps = {
  active: 'day' | 'week'
  onChange: (tab: 'day' | 'week') => void
}

export function TabStrip({ active, onChange }: TabStripProps) {
  return (
    <div
      className="flex h-12 items-start p-1 rounded-xl w-full shrink-0"
      style={{ background: 'var(--mw-tab-bg)' }}
    >
      <button
        className="flex flex-1 h-full items-center justify-center rounded-[9px] text-[16px] font-medium leading-none transition-colors min-w-0"
        style={
          active === 'day'
            ? {
                background: 'var(--mw-tab-active)',
                color: 'var(--mw-text-primary)',
                border: '1px solid var(--mw-border)',
              }
            : { color: 'var(--mw-text-muted)' }
        }
        onClick={() => onChange('day')}
      >
        Day
      </button>
      <button
        className="flex flex-1 h-full items-center justify-center rounded-[9px] text-[16px] font-medium leading-none transition-colors min-w-0"
        style={
          active === 'week'
            ? {
                background: 'var(--mw-tab-active)',
                color: 'var(--mw-text-primary)',
                border: '1px solid var(--mw-border)',
              }
            : { color: 'var(--mw-text-muted)' }
        }
        onClick={() => onChange('week')}
      >
        Week
      </button>
    </div>
  )
}

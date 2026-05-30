import { CloudRain, Sun } from 'lucide-react'
import { getRainfallStatus, getProgressPercent } from '@/lib/rainfallUtils'

function rankToFill(rank?: number): string {
  if (!rank || rank >= 7) return 'var(--mw-fill-100)'
  const shade = (8 - rank) * 100 // rank 1→700, 2→600, …, 7→100
  return `var(--mw-fill-${shade})`
}

type StationRowProps = {
  label: string
  rainfallMm: number
  maxMm: number
  rank?: number
  onClick?: () => void
}

export function StationRow({ label, rainfallMm, maxMm, rank, onClick }: StationRowProps) {
  const status = getRainfallStatus(rainfallMm)
  const fillPct = getProgressPercent(rainfallMm, maxMm)
  const isHeavy = status === 'heavy'
  const isNone = status === 'none'

  const fillColor = rankToFill(rank)

  return (
    <li
      className="flex flex-col gap-[6px] h-16 w-full px-3 py-[10px] rounded-lg shrink-0"
      style={{ background: 'var(--mw-surface)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full overflow-hidden whitespace-nowrap">
        <span className="text-[18px] leading-none shrink-0" style={{ color: 'var(--mw-text-primary)' }}>
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isNone && (
            <div className="flex items-center gap-1">
              <Sun size={16} style={{ color: 'var(--mw-status-no-rain)' }} />
              <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
                No Rain
              </span>
            </div>
          )}
          {isHeavy && (
            <div className="flex items-center gap-1">
              <CloudRain size={16} style={{ color: fillColor }} />
              <span className="text-[16px] leading-none" style={{ color: fillColor }}>
                Heavy Rain
              </span>
            </div>
          )}
          {!isNone && (
            <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
              {rainfallMm.toFixed(1)} mm
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-[6px] w-full rounded-[3px]" style={{ background: isNone ? 'transparent' : 'var(--mw-progress-track)', border: isNone ? '1px solid var(--mw-border)' : 'none' }}>
        {!isNone && fillPct > 0 && (
          <div
            className="absolute left-0 top-0 h-[6px] rounded-[3px]"
            style={{ width: `${fillPct}%`, background: fillColor }}
          />
        )}
      </div>
    </li>
  )
}

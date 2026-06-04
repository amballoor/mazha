import { Sun } from 'lucide-react'
import type { RainfallStatus } from '@/types/rainfall'
import { getRainfallStatus, getStatusLabel, getProgressPercent } from '@/lib/rainfallUtils'

function getBarStyle(status: RainfallStatus): string {
  const B = '#4aa2d1'  // color/progress/fill/700
  const Y = '#ffc107'  // color/progress/Yellow Alert
  const O = '#ff6d00'  // color/progress/Orange Alert
  const R = '#df1f1f'  // color/progress/Red Alert
  switch (status) {
    case 'yellow': return `linear-gradient(to right, ${B}, ${Y})`
    case 'orange': return `linear-gradient(to right, ${B}, ${Y}, ${O})`
    case 'red':    return `linear-gradient(to right, ${B}, ${Y}, ${O}, ${R})`
    default:       return B
  }
}

function getAlertDotColor(status: RainfallStatus): string | null {
  if (status === 'yellow') return 'var(--mw-alert-yellow)'
  if (status === 'orange') return 'var(--mw-alert-orange)'
  if (status === 'red')    return 'var(--mw-alert-red)'
  return null
}

type StationRowProps = {
  label: string
  rainfallMm: number
  maxMm: number
  blueShade?: string
  onClick?: () => void
}

export function StationRow({ label, rainfallMm, maxMm, blueShade, onClick }: StationRowProps) {
  const status = getRainfallStatus(rainfallMm)
  const fillPct = getProgressPercent(rainfallMm, maxMm)
  const isNone = status === 'none'
  const isAlert = status === 'yellow' || status === 'orange' || status === 'red'
  const alertDot = getAlertDotColor(status)
  const statusLabel = getStatusLabel(status)
  const barBg = (status === 'blue' && blueShade) ? blueShade : getBarStyle(status)

  return (
    <li
      className="flex flex-col gap-[6px] h-16 w-full px-3 py-[10px] rounded-lg shrink-0"
      style={{ background: 'var(--mw-surface)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full overflow-hidden">
        <span className="text-[18px] leading-none shrink-0 whitespace-nowrap" style={{ color: 'var(--mw-text-primary)' }}>
          {label}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {/* No Rain */}
          {isNone && (
            <div className="flex items-center gap-1">
              <Sun size={16} style={{ color: 'var(--mw-status-no-rain)' }} />
              <span className="text-[16px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
                No Rain
              </span>
            </div>
          )}

          {/* Alert badge (yellow / orange / red) */}
          {isAlert && alertDot && (
            <div className="flex items-center gap-1 shrink-0">
              <span
                className="rounded-full shrink-0"
                style={{ width: 8, height: 8, background: alertDot }}
              />
              <span className="text-[14px] font-normal leading-none whitespace-nowrap" style={{ color: alertDot ?? undefined }}>
                {statusLabel}
              </span>
            </div>
          )}

          {/* mm value — shown for all except none */}
          {!isNone && (
            <span className="text-[16px] leading-none whitespace-nowrap" style={{ color: 'var(--mw-text-muted)' }}>
              {rainfallMm.toFixed(1)} mm
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-[6px] w-full rounded-[3px]"
        style={{
          background: isNone ? 'transparent' : 'var(--mw-progress-track)',
          border: isNone ? '1px solid var(--mw-border)' : 'none',
        }}
      >
        {!isNone && fillPct > 0 && (
          <div
            className="absolute left-0 top-0 h-[6px] rounded-[3px]"
            style={{ width: `${fillPct}%`, background: barBg }}
          />
        )}
      </div>
    </li>
  )
}

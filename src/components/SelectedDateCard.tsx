import type { CSSProperties, Ref } from 'react'
import { CloudRainWind, BarChartHorizontal, Sun } from 'lucide-react'
import type { RainfallStatus } from '@/types/rainfall'
import { formatDay } from '@/lib/rainfallUtils'

// spacing: xs=4px gap-1, md=12px gap-3, 3xl=28px gap-7, 2xl=24px p-6
// SVG embedded directly without encodeURIComponent — %23 is already pre-encoded for #
function getCardBackground(alertStatus: RainfallStatus): CSSProperties {
  const base = 'linear-gradient(90deg,rgb(249,252,253) 0%,rgb(249,252,253) 100%)'
  const colorMap: Partial<Record<RainfallStatus, string>> = {
    orange: 'rgba(255,109,0',
    red:    'rgba(223,31,31',
    yellow: 'rgba(255,193,7',
  }
  const c = colorMap[alertStatus]
  if (!c) return { background: '#f9fcfd' }
  const svg =
    `<svg viewBox='0 0 372 180' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'>` +
    `<rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/>` +
    `<defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' ` +
    `gradientTransform='matrix(-18.6 23.599 -15.321 -13.225 372 -100.47)'>` +
    `<stop stop-color='${c},1)' offset='0'/><stop stop-color='${c},0)' offset='1'/>` +
    `</radialGradient></defs></svg>`
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${svg}"),${base}`,
  }
}

function getAlertColor(status: RainfallStatus): string | null {
  if (status === 'yellow') return 'var(--mw-alert-yellow)'
  if (status === 'orange') return 'var(--mw-alert-orange)'
  if (status === 'red')    return 'var(--mw-alert-red)'
  return null
}

function getAlertLabel(status: RainfallStatus): string {
  if (status === 'yellow') return 'Yellow Alert'
  if (status === 'orange') return 'Orange Alert'
  if (status === 'red')    return 'Red Alert'
  return ''
}

type Props = {
  date: Date
  rainfallMm: number
  weekMm: number
  alertStatus: RainfallStatus
  cardRef: Ref<HTMLDivElement>
  onAnimationEnd: () => void
  cardPhase: 'idle' | 'leaving' | 'entering'
}

export function SelectedDateCard({
  date, rainfallMm, weekMm, alertStatus, cardRef, onAnimationEnd, cardPhase,
}: Props) {
  const isAlert  = alertStatus === 'yellow' || alertStatus === 'orange' || alertStatus === 'red'
  // isNoRain = today AND the entire week have 0mm → "week without rain" variant (sun icon)
  const isNoRain = alertStatus === 'none' && weekMm === 0
  const alertColor = getAlertColor(alertStatus)
  const alertLabel = getAlertLabel(alertStatus)

  // Mazha/Label/Stat: Geist Medium 18px lh=100%
  const datePill = (
    <div
      className="inline-flex items-center justify-center self-start px-2 py-1 rounded-[4px]"
      style={{ background: 'var(--mw-fill-100)' }}
    >
      <span
        className="text-[18px] font-medium leading-none whitespace-nowrap"
        style={{ color: 'var(--mw-text-primary)' }}
      >
        {formatDay(date)}
      </span>
    </div>
  )

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-7 p-6 rounded-xl w-full shrink-0"
      onAnimationEnd={onAnimationEnd}
      style={{
        border: '1px solid var(--mw-progress-fill)',
        animation:
          cardPhase === 'leaving'  ? 'card-fade-out 300ms ease-out forwards' :
          cardPhase === 'entering' ? 'card-fade-in 300ms ease-out forwards' :
          'none',
        ...getCardBackground(alertStatus),
      }}
    >
      {/* Top row — alert/no-rain: flex-row; no-alert/blue: flex-col */}
      {isAlert || isNoRain ? (
        <div className="flex items-start gap-7 w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Mazha/Body/Default: Geist Regular 16px lh=100% */}
            <span
              className="text-[16px] font-normal leading-none whitespace-nowrap"
              style={{ color: 'var(--mw-text-muted)' }}
            >
              Selected Date
            </span>
            {datePill}
          </div>

          {isAlert && alertColor && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: alertColor }} />
              {/* Mazha/Label/Stat: Geist Medium 18px lh=100% */}
              <span
                className="text-[18px] font-medium leading-none whitespace-nowrap"
                style={{ color: alertColor }}
              >
                {alertLabel}
              </span>
            </div>
          )}

          {isNoRain && (
            <Sun size={38} strokeWidth={1} style={{ color: 'var(--mw-status-no-rain)', flexShrink: 0 }} />
          )}
        </div>
      ) : (
        /* No Alert (blue) — flex-col, no badge */
        <div className="flex flex-col gap-1 w-full">
          {/* Mazha/Body/Default: Geist Regular 16px lh=100% */}
          <span
            className="text-[16px] font-normal leading-none whitespace-nowrap"
            style={{ color: 'var(--mw-text-muted)' }}
          >
            Selected Date
          </span>
          {datePill}
        </div>
      )}

      {/* Stats row — spacing/3xl=28px between blocks, spacing/md=12px icon-to-text (gap-3) */}
      <div className="flex gap-7 items-start overflow-hidden w-full">
        <div className="flex items-end gap-3 shrink-0">
          <CloudRainWind size={38} strokeWidth={1} style={{ color: 'var(--mw-text-muted)', flexShrink: 0 }} />
          <div className="flex flex-col gap-1">
            {/* Mazha/Body/Default: Geist Regular 16px lh=100% */}
            <span className="text-[16px] font-normal leading-none whitespace-nowrap" style={{ color: 'var(--mw-text-muted)' }}>
              Rainfall
            </span>
            {/* Mazha/Label/Station: Geist Regular 18px lh=100% */}
            <span className="text-[18px] font-normal leading-none" style={{ color: 'var(--mw-text-primary)' }}>
              {rainfallMm.toFixed(1)} mm
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 shrink-0">
          <BarChartHorizontal size={38} strokeWidth={1} style={{ color: 'var(--mw-text-muted)', flexShrink: 0 }} />
          <div className="flex flex-col gap-1">
            {/* Mazha/Body/Default: Geist Regular 16px lh=100% */}
            <span className="text-[16px] font-normal leading-none whitespace-nowrap" style={{ color: 'var(--mw-text-muted)' }}>
              Week Overall
            </span>
            {/* Mazha/Label/Station: Geist Regular 18px lh=100% */}
            <span className="text-[18px] font-normal leading-none" style={{ color: 'var(--mw-text-primary)' }}>
              {weekMm.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { MapPin } from 'lucide-react'
import { useWeatherData } from '@/hooks/useWeatherData'

export function HeaderCard() {
  const { precipitationPct, tempMax } = useWeatherData()
  return (
    <div className="flex flex-col items-start w-full gap-[28px]">
      {/* Top row: app name + location */}
      <div className="flex flex-col gap-2 items-center justify-center w-full px-4 py-[14px] h-[85px]">
        <span className="text-[14px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
          Rain Tracker
        </span>
        <div className="flex items-center gap-1">
          <MapPin size={16} style={{ color: 'var(--mw-text-primary)' }} />
          <span className="text-[18px] leading-none" style={{ color: 'var(--mw-text-primary)' }}>
            Amballoor Panchayat
          </span>
        </div>
      </div>

      {/* Bottom row: stat tiles */}
      <div
        className="flex items-stretch w-full rounded-lg overflow-hidden h-[85px]"
        style={{ background: 'var(--mw-surface)', border: '1px solid var(--mw-border)' }}
      >
        {/* Left tile: rain chance */}
        <div className="flex flex-1 flex-col gap-2 items-start justify-center px-4 py-[14px] min-w-0">
          <span className="text-[10px] leading-none uppercase" style={{ color: 'var(--mw-text-muted)' }}>
            Today
          </span>
          <div className="flex flex-col items-start">
            <span className="text-[16px] font-medium leading-none" style={{ color: 'var(--mw-text-primary)' }}>
              {precipitationPct !== null ? `${precipitationPct}%` : '—'}
            </span>
            <span className="text-[14px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
              chance for rain
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px self-stretch" style={{ background: 'var(--mw-border)' }} />

        {/* Right tile: temperature */}
        <div className="flex flex-1 flex-col gap-2 items-start justify-center px-4 py-[14px] min-w-0">
          <span className="text-[10px] leading-none uppercase" style={{ color: 'var(--mw-text-muted)' }}>
            Today
          </span>
          <div className="flex flex-col items-start">
            <span className="text-[16px] font-medium leading-none" style={{ color: 'var(--mw-text-primary)' }}>
              {tempMax !== null ? `${Math.round(tempMax)}°` : '—'}
            </span>
            <span className="text-[14px] leading-none" style={{ color: 'var(--mw-text-muted)' }}>
              temperature
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

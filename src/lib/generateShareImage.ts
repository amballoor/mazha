import { getRainfallStatus } from '@/lib/rainfallUtils'

const FONT = '"Geist Variable", system-ui, sans-serif'

const B = '#4aa2d1'
const Y = '#ffc107'
const O = '#ff6d00'
const R = '#df1f1f'

function getBarFill(
  ctx: CanvasRenderingContext2D,
  mm: number,
  barX: number,
  fillW: number,
): string | CanvasGradient {
  const status = getRainfallStatus(mm)
  if (status === 'none' || status === 'blue') return B

  const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0)
  if (status === 'yellow') {
    grad.addColorStop(0, B); grad.addColorStop(1, Y)
  } else if (status === 'orange') {
    grad.addColorStop(0, B); grad.addColorStop(0.5, Y); grad.addColorStop(1, O)
  } else {
    grad.addColorStop(0, B); grad.addColorStop(0.33, Y)
    grad.addColorStop(0.67, O); grad.addColorStop(1, R)
  }
  return grad
}

function formatShareDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function generateShareImage(
  entries: { location: string; rainfallMm: number }[],
  date: Date,
): Promise<Blob> {
  await document.fonts.ready

  // Canvas dimensions — 3:4 portrait for WhatsApp story
  const W = 900
  const H = 1200

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Sort heaviest first
  const sorted = [...entries].sort((a, b) => b.rainfallMm - a.rainfallMm)
  const maxMm = Math.max(...sorted.map(e => e.rainfallMm), 10)

  // ── Layout ──────────────────────────────────────────────
  const HEADER_H = 196
  const FOOTER_H = 76
  const CHART_H = H - HEADER_H - FOOTER_H        // 928

  const PAD_X = 36
  const LABEL_W = 216
  const GAP_LB = 12                               // label → bar gap
  const VALUE_W = 84
  const GAP_BV = 12                               // bar → value gap
  const BAR_X = PAD_X + LABEL_W + GAP_LB         // 264
  const BAR_AREA = W - BAR_X - GAP_BV - VALUE_W - PAD_X  // 900-264-12-84-36 = 504
  const BAR_H = 40

  const CHART_TOP_PAD = 40
  const CHART_BOT_PAD = 40
  const ROWS_AREA = CHART_H - CHART_TOP_PAD - CHART_BOT_PAD  // 848
  const ROW_H = ROWS_AREA / 12                   // ~70.7

  // ── HEADER ──────────────────────────────────────────────
  ctx.fillStyle = '#212121'
  ctx.fillRect(0, 0, W, HEADER_H)

  // App name
  ctx.font = `600 34px ${FONT}`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Amballoor Panchayat', W / 2, HEADER_H * 0.36)

  // Sub-label
  ctx.font = `400 19px ${FONT}`
  ctx.fillStyle = '#999999'
  ctx.fillText('Mazha Rain Tracker', W / 2, HEADER_H * 0.58)

  // Date
  ctx.font = `500 22px ${FONT}`
  ctx.fillStyle = '#cccccc'
  ctx.fillText(formatShareDate(date), W / 2, HEADER_H * 0.80)

  // ── CHART AREA (white) ───────────────────────────────────
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, HEADER_H, W, CHART_H)

  sorted.forEach((entry, i) => {
    const rowY = HEADER_H + CHART_TOP_PAD + i * ROW_H
    const barY = rowY + (ROW_H - BAR_H) / 2
    const midY = barY + BAR_H / 2

    const fillW = entry.rainfallMm === 0
      ? 0
      : Math.max(8, Math.round((entry.rainfallMm / maxMm) * BAR_AREA))

    // Location label
    ctx.font = `400 21px ${FONT}`
    ctx.fillStyle = '#212121'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(entry.location, PAD_X, midY)

    // Track (background)
    roundRect(ctx, BAR_X, barY, BAR_AREA, BAR_H, 6)
    ctx.fillStyle = '#ebebeb'
    ctx.fill()

    // Fill bar
    if (fillW > 0) {
      roundRect(ctx, BAR_X, barY, fillW, BAR_H, 6)
      ctx.fillStyle = getBarFill(ctx, entry.rainfallMm, BAR_X, fillW)
      ctx.fill()
    }

    // mm value
    const mmLabel = entry.rainfallMm === 0 ? '–' : `${entry.rainfallMm.toFixed(1)} mm`
    ctx.font = `500 20px ${FONT}`
    ctx.fillStyle = entry.rainfallMm === 0 ? '#aaaaaa' : '#212121'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(mmLabel, BAR_X + BAR_AREA + GAP_BV, midY)
  })

  // ── FOOTER ───────────────────────────────────────────────
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, HEADER_H + CHART_H, W, FOOTER_H)

  ctx.font = `400 18px ${FONT}`
  ctx.fillStyle = '#8a8a8a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('mazha.amballoor.in', W / 2, HEADER_H + CHART_H + FOOTER_H / 2)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/png',
    )
  })
}

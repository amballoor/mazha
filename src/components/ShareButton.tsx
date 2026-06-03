import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { generateShareImage } from '@/lib/generateShareImage'
import { format } from 'date-fns'

type ShareButtonProps = {
  entries: { location: string; rainfallMm: number }[]
  date: Date
}

export function ShareButton({ entries, date }: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleShare() {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const blob = await generateShareImage(entries, date)
      const fileName = `mazha-rainfall-${format(date, 'yyyy-MM-dd')}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Amballoor Panchayat Rainfall' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className="flex items-center justify-center gap-4 h-[52px] w-full rounded-[8px] px-6 disabled:opacity-60"
      style={{ background: 'var(--mw-text-primary)' }}
    >
      {isGenerating ? (
        <Loader2 size={24} className="animate-spin text-white" />
      ) : (
        <Share2 size={24} className="text-white" />
      )}
      <span
        className="text-white text-[16px] font-medium leading-none whitespace-nowrap"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {isGenerating ? 'Generating…' : 'Share this as an image'}
      </span>
    </button>
  )
}

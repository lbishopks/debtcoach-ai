'use client'
import { useEffect, useRef } from 'react'

interface Props {
  /** Adsense ad slot ID — get from your AdSense account */
  slot: string
  /** 'auto' for responsive, or specific format */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * Google AdSense ad unit.
 * Only renders when NEXT_PUBLIC_GOOGLE_ADSENSE_ID is set.
 * Only shown to free-plan users — the parent component should gate this.
 *
 * Setup:
 * 1. Sign up at https://adsense.google.com
 * 2. Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX to .env.local
 * 3. Add individual ad slot IDs per placement
 */
export function GoogleAd({ slot, format = 'auto', className = '' }: Props) {
  const adRef = useRef<HTMLDivElement>(null)
  const pubId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

  useEffect(() => {
    if (!pubId) return
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (e) {
      // AdSense might block in dev or ad blockers — fail silently
    }
  }, [pubId])

  if (!pubId) {
    // Dev placeholder so layout stays consistent while testing
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`flex items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-xl text-white/20 text-xs ${className}`} style={{ minHeight: 90 }}>
          Ad placeholder · Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID to enable
        </div>
      )
    }
    return null
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

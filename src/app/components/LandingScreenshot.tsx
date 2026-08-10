'use client'

import { useState } from 'react'
import Image from 'next/image'

export function LandingScreenshot() {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative w-full aspect-[16/9] min-h-[280px] bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
      {!hasError ? (
        <Image
          src="/screenshot-board.png"
          alt="Preview Kanban Board Ruwet"
          fill
          className="object-cover rounded-xl"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="p-8 text-center space-y-3 max-w-md">
          <div className="text-4xl">📋</div>
          <h4 className="text-base font-bold text-white">Preview Kanban Board Ruwet</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tampilan workspace modern dengan kolom interaktif, badge stale real-time, dan manajemen tim terpadu.
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'

const SCREENSHOTS = [
  {
    id: 'dashboard',
    label: 'Dashboard & Boards',
    src: '/ruwet-dashboard.png',
    alt: 'Dashboard Ruwet Kanban',
  },
  {
    id: 'board',
    label: 'Kanban Board',
    src: '/ruwet-board.png',
    alt: 'Tampilan Board & Columns',
  },
  {
    id: 'comments',
    label: 'Diskusi & Komentar',
    src: '/ruwet-comments.png',
    alt: 'Tampilan Diskusi Komentar',
  },
  {
    id: 'statistic',
    label: 'Ringkasan & Statistik',
    src: '/ruwet-statistic.png',
    alt: 'Statistik & Ringkasan Board',
  },
]

export function LandingScreenshot() {
  const [activeTab, setActiveTab] = useState(0)
  const [errorTabs, setErrorTabs] = useState<Record<number, boolean>>({})

  const current = SCREENSHOTS[activeTab]

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Screenshot Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
        {SCREENSHOTS.map((tab, idx) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === idx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/30'
                : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Screenshot Display Frame */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] bg-zinc-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner">
        {!errorTabs[activeTab] ? (
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={85}
            className="object-cover object-top rounded-xl transition-all duration-300"
            onError={() =>
              setErrorTabs((prev) => ({ ...prev, [activeTab]: true }))
            }
          />
        ) : (
          <div className="p-8 text-center space-y-3 max-w-md flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.25-2.142V9M6 8.25h.008v.008H6V8.25zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white">{current.alt}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tampilan workspace modern dengan kolom interaktif, badge stale real-time, dan manajemen tim terpadu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { dismissOnboarding } from '../boards/actions'

interface OnboardingChecklistProps {
  hasBoard: boolean
  hasMembers: boolean
  hasTask: boolean
}

export function OnboardingChecklist({
  hasBoard,
  hasMembers,
  hasTask,
}: OnboardingChecklistProps) {
  const [loading, setLoading] = useState(false)
  const [hidden, setHidden] = useState(false)

  const steps = [
    {
      id: 'board',
      title: 'Buat board pertama Anda',
      description: 'Mulai buat workspace kanban untuk tim Anda.',
      completed: hasBoard,
    },
    {
      id: 'members',
      title: 'Undang anggota tim',
      description: 'Bagikan link board atau undang anggota ke workspace.',
      completed: hasMembers,
    },
    {
      id: 'task',
      title: 'Buat task pertama Anda',
      description: 'Tambahkan kartu tugas pertama di kolom kanban.',
      completed: hasTask,
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  async function handleDismiss() {
    try {
      setLoading(true)
      setHidden(true)
      await dismissOnboarding()
    } catch (err) {
      console.error('Failed to dismiss onboarding:', err)
    } finally {
      setLoading(false)
    }
  }

  if (hidden || completedCount === steps.length) {
    return null
  }

  return (
    <div className="rounded-2xl glass-panel p-6 border border-indigo-500/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
            🚀
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Checklist Langkah Awal Ruwet ({completedCount}/{steps.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Selesaikan 3 langkah mudah ini untuk memulai produktivitas tim.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          disabled={loading}
          className="text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/80 px-3 py-1.5 rounded-lg border border-white/5 transition"
        >
          Tutup Checklist ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
        <div
          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-3.5 rounded-xl border transition-all ${
              step.completed
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-zinc-900/60 border-white/5 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.completed
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                }`}
              >
                {step.completed ? '✓' : idx + 1}
              </span>
              <span className="text-xs font-bold">{step.title}</span>
            </div>
            <p className="text-[11px] text-zinc-400 pl-7 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

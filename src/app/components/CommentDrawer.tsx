'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentSection } from '../boards/[id]/CommentSection'

type CommentDrawerProps = {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
  taskNumber?: number
  boardId: string
}

export function CommentDrawer({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskNumber,
  boardId,
}: CommentDrawerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && mounted && (
        <>
          {/* Backdrop */}
          {createPortal(
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs"
              />

              {/* Slide-over Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="fixed inset-y-0 right-0 z-[9999] flex w-full max-w-md flex-col bg-[#2C2C30] border-l border-zinc-800/80 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-[#1A1A1E]">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {taskNumber !== undefined && (
                      <span className="inline-block text-xs font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        #{taskNumber}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white truncate" title={taskTitle}>
                      {taskTitle}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
                    title="Tutup Komentar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sub-header title */}
                <div className="px-5 py-2.5 bg-zinc-950/20 border-b border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Diskusi Komentar
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Real-time</span>
                </div>

                {/* Comment Section Content */}
                <div className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
                  <CommentSection taskId={taskId} boardId={boardId} />
                </div>
              </motion.div>
            </>,
            document.body
          )}
        </>
      )}
    </AnimatePresence>
  )
}

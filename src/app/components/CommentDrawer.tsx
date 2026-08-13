'use client'

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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Right Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/50">
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
            <div className="flex-1 overflow-y-auto p-4">
              <CommentSection taskId={taskId} boardId={boardId} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

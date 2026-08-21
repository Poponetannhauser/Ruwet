'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { NotificationBell } from './NotificationBell'
import { TelegramSettingsModal } from './TelegramSettingsModal'
import { BoardSummaryModal } from '../boards/[id]/BoardSummaryModal'
import { BoardMembersModal } from '../boards/[id]/BoardMembersModal'

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Column = {
  id: string
  name: string
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  assignee_id: string | null
  due_date: string | null
  status_updated_at?: string | null
  profiles?: {
    full_name: string
    avatar_url: string | null
  } | null
}

type AppSidebarProps = {
  userEmail?: string | null
  logoutAction?: () => Promise<void>
  hasTelegramLinked?: boolean
  currentBoardId?: string
  boardName?: string
  members?: Member[]
  columns?: Column[]
  tasks?: Task[]
  staleThresholdHours?: number
  isOwner?: boolean
}

export function AppSidebar({
  userEmail,
  logoutAction,
  hasTelegramLinked = false,
  currentBoardId,
  boardName,
  members = [],
  columns = [],
  tasks = [],
  staleThresholdHours = 48,
  isOwner = false,
}: AppSidebarProps) {
  const pathname = usePathname()
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isDashboardActive = pathname === '/'
  const isBoardActive = currentBoardId ? pathname === `/boards/${currentBoardId}` : false
  const isDocsActive = currentBoardId ? pathname.startsWith(`/boards/${currentBoardId}/docs`) : false

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between border-b border-zinc-800/80 bg-[#2C2C30] px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:text-white"
            aria-label="Toggle Navigation Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image
            src="/ruwet-logo.png"
            alt="Logo Ruwet"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg object-cover border border-zinc-800"
          />
          <span className="font-bold text-white text-base tracking-tight">Ruwet</span>
        </div>

        <div className="flex items-center gap-2">
          {userEmail && <NotificationBell />}
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#2C2C30] border-r border-zinc-800/80 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/ruwet-logo.png"
              alt="Logo Ruwet"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover border border-zinc-800 group-hover:border-zinc-700 transition"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Ruwet
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Kanban Workspace</span>
            </div>
          </Link>

          <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 font-mono">
            v0.3.0
          </span>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Navigasi Utama
            </div>
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                isDashboardActive
                  ? 'bg-[#383842] text-white shadow-xs'
                  : 'text-zinc-400 hover:bg-[#232328] hover:text-zinc-200'
              }`}
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span>Dashboard Kanban</span>
            </Link>
          </div>

          {/* Contextual Board Workspace Menu */}
          {currentBoardId && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                <span>Board Workspace</span>
                {boardName && (
                  <span className="truncate max-w-[100px] text-zinc-400 font-semibold" title={boardName}>
                    {boardName}
                  </span>
                )}
              </div>

              <Link
                href={`/boards/${currentBoardId}`}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isBoardActive
                    ? 'bg-[#383842] text-white shadow-xs font-bold'
                    : 'text-zinc-400 hover:bg-[#232328] hover:text-zinc-200'
                }`}
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Kanban Board</span>
              </Link>

              <Link
                href={`/boards/${currentBoardId}/docs`}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isDocsActive
                    ? 'bg-[#383842] text-white shadow-xs font-bold'
                    : 'text-zinc-400 hover:bg-[#232328] hover:text-zinc-200'
                }`}
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span>Docs &amp; Specs Hub</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSummaryModalOpen(true)
                  setIsMobileOpen(false)
                }}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-[#232328] hover:text-zinc-200 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <span>Ringkasan Board</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMembersModalOpen(true)
                  setIsMobileOpen(false)
                }}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-[#232328] hover:text-zinc-200 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span>Anggota Tim</span>
                </div>
                {members.length > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded">
                    {members.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Integration & Tools */}
          {userEmail && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Asisten &amp; Notifikasi
              </div>

              <button
                onClick={() => {
                  setIsTelegramModalOpen(true)
                  setIsMobileOpen(false)
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                  hasTelegramLinked
                    ? 'border-sky-800/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/40'
                    : 'border-zinc-800/80 bg-[#1c1c24] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span>Bot Telegram</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    hasTelegramLinked
                      ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {hasTelegramLinked ? 'Aktif' : 'Link'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Profile & Logout */}
        {userEmail && (
          <div className="border-t border-zinc-800/80 p-4 space-y-3 bg-[#16161c]/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-zinc-700">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate" title={userEmail}>
                  {userEmail}
                </span>
                <span className="text-[10px] text-zinc-500">Workspace Member</span>
              </div>
            </div>

            {logoutAction && (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span>Keluar</span>
                </button>
              </form>
            )}
          </div>
        )}
      </aside>

      {/* Telegram Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Board Summary Modal */}
      {currentBoardId && (
        <BoardSummaryModal
          boardName={boardName || 'Board'}
          staleThresholdHours={staleThresholdHours}
          columns={columns}
          tasks={tasks}
          members={members}
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}

      {/* Board Members Modal */}
      {currentBoardId && (
        <BoardMembersModal
          boardId={currentBoardId}
          members={members}
          isOwner={isOwner}
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}
    </>
  )
}

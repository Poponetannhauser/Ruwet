'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/app/notificationActions'

type Notification = {
  id: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchNotifs() {
    const res = await getNotifications()
    if (res.notifications) {
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true

    async function load() {
      const res = await getNotifications()
      if (isMounted && res.notifications) {
        setNotifications(res.notifications)
        setUnreadCount(res.unreadCount || 0)
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    load()

    const supabase = createClient()
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          load()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleItemClick(notif: Notification) {
    if (!notif.is_read) {
      await markAsRead(notif.id)
      fetchNotifs()
    }
    setIsOpen(false)
  }

  async function handleMarkAll() {
    await markAllAsRead()
    fetchNotifs()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        title="Notifikasi"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute 0 top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-md shadow-rose-600/40">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl glass-modal p-4 shadow-2xl border border-white/10 z-50">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h4 className="font-bold text-xs text-white">
              Notifikasi {unreadCount > 0 && `(${unreadCount})`}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>


          <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5">
            {loading ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`cursor-pointer rounded-lg p-2 text-xs transition ${
                    n.is_read
                      ? 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800'
                      : 'bg-indigo-50/70 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70'
                  }`}
                >
                  {n.link ? (
                    <Link href={n.link} className="block">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                        <span>{n.title}</span>
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        {n.message}
                      </p>
                      <span className="mt-1 block text-[9px] text-zinc-400">
                        {new Date(n.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </Link>
                  ) : (
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                        <span>{n.title}</span>
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        {n.message}
                      </p>
                      <span className="mt-1 block text-[9px] text-zinc-400">
                        {new Date(n.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

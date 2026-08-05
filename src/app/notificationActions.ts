'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  const supabase = await createClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    link: link || null,
  })

  if (error) {
    console.error('Failed to create notification:', error.message)
  }
}

export async function getNotifications() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { notifications: [], unreadCount: 0 }
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return { error: error.message, notifications: [], unreadCount: 0 }
  }

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length

  return { notifications: notifications || [], unreadCount }
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function markAllAsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

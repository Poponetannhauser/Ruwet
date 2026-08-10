import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  sendTelegramMessage,
  formatAssignNotification,
  formatStaleNotification,
} from '../_shared/telegram.ts'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'

  // Validate secret header if configured
  if (webhookSecret) {
    const receivedSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (receivedSecret !== webhookSecret) {
      console.warn('Unauthorized notifier call: invalid secret token header')
      return new Response('Unauthorized', { status: 401 })
    }
  }

  if (!botToken || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables for telegram-notifier')
    return new Response('Server Configuration Error', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const payload = await req.json()
    const { type, record, old_record, event_type } = payload

    // Event 1: Task Assignment (via Database Webhook or direct trigger)
    if (
      event_type === 'assign' ||
      (type === 'UPDATE' && record?.assignee_id && record.assignee_id !== old_record?.assignee_id)
    ) {
      const assigneeId = record?.assignee_id || payload.assignee_id
      const taskId = record?.id || payload.task_id
      const boardId = record?.board_id || payload.board_id
      const taskTitle = record?.title || payload.task_title || 'Tugas Baru'

      if (assigneeId && taskId && boardId) {
        // Fetch assignee profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('telegram_chat_id')
          .eq('id', assigneeId)
          .single()

        if (profile?.telegram_chat_id) {
          // Fetch board name
          const { data: board } = await supabase
            .from('boards')
            .select('name')
            .eq('id', boardId)
            .single()

          const boardName = board?.name || 'Kanban Board'
          const taskLink = `${appBaseUrl}/boards/${boardId}`

          const messageText = formatAssignNotification({
            taskTitle,
            boardName,
            taskLink,
          })

          await sendTelegramMessage(botToken, {
            chat_id: profile.telegram_chat_id,
            text: messageText,
            parse_mode: 'HTML',
          })
        }
      }
    }

    // Event 2: Stale Task Notification
    if (event_type === 'stale' || payload.stale === true) {
      const assigneeId = record?.assignee_id || payload.assignee_id
      const taskId = record?.id || payload.task_id
      const boardId = record?.board_id || payload.board_id
      const taskTitle = record?.title || payload.task_title || 'Tugas Stale'
      const hoursStale = payload.hours_stale || payload.stale_hours || 48

      if (assigneeId && taskId && boardId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('telegram_chat_id')
          .eq('id', assigneeId)
          .single()

        if (profile?.telegram_chat_id) {
          const { data: board } = await supabase
            .from('boards')
            .select('name')
            .eq('id', boardId)
            .single()

          const boardName = board?.name || 'Kanban Board'
          const taskLink = `${appBaseUrl}/boards/${boardId}`

          const messageText = formatStaleNotification({
            taskTitle,
            boardName,
            hoursStale,
            taskLink,
          })

          await sendTelegramMessage(botToken, {
            chat_id: profile.telegram_chat_id,
            text: messageText,
            parse_mode: 'HTML',
          })
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Notifier processing error:', err)
    // Return 200 OK so failed notification side-effects don't break main DB transactions
    return new Response('OK', { status: 200 })
  }
})

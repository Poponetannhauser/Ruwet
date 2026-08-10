import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  sendTelegramMessage,
  escapeHtml,
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
    const { type, table, record, old_record, event_type } = payload

    // Event 1: Task Assignment (via Database Webhook or direct trigger)
    if (
      event_type === 'assign' ||
      (table === 'tasks' && type === 'UPDATE' && record?.assignee_id && record.assignee_id !== old_record?.assignee_id)
    ) {
      const assigneeId = record?.assignee_id || payload.assignee_id
      const taskId = record?.id || payload.task_id
      const boardId = record?.board_id || payload.board_id
      const taskTitle = record?.title || payload.task_title || 'Tugas Baru'

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

    // Event 3: Comment Notification (No-content for privacy, per PRD 1.1)
    if (
      event_type === 'comment' ||
      (table === 'comments' && type === 'INSERT')
    ) {
      const taskId = record?.task_id || payload.task_id
      const commenterId = record?.user_id || payload.commenter_id

      if (taskId && commenterId) {
        // Fetch task details
        const { data: task } = await supabase
          .from('tasks')
          .select('id, task_number, title, board_id, assignee_id, boards(name)')
          .eq('id', taskId)
          .single()

        // Only notify if task is assigned and commenter is NOT the assignee
        if (task && task.assignee_id && task.assignee_id !== commenterId) {
          const { data: assigneeProfile } = await supabase
            .from('profiles')
            .select('telegram_chat_id')
            .eq('id', task.assignee_id)
            .single()

          if (assigneeProfile?.telegram_chat_id) {
            const { data: commenterProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', commenterId)
              .single()

            const commenterName = commenterProfile?.full_name || 'Seseorang'
            const boardName = task.boards?.name || 'Board'
            const numStr = task.task_number !== null && task.task_number !== undefined ? `#${task.task_number} ` : ''
            const taskLink = `${appBaseUrl}/boards/${task.board_id}`

            // Activity-only notification, EXCLUDING comment text content for privacy
            const commentMsg =
              `💬 <b>Komentar Baru pada Task</b>\n\n` +
              `<b>${escapeHtml(commenterName)}</b> menambahkan komentar pada task <b>${numStr}${escapeHtml(task.title)}</b> di board <b>${escapeHtml(boardName)}</b>.\n\n` +
              `🔗 <a href="${taskLink}">Buka Task di Ruwet</a>`

            await sendTelegramMessage(botToken, {
              chat_id: assigneeProfile.telegram_chat_id,
              text: commentMsg,
              parse_mode: 'HTML',
            })
          }
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Notifier processing error:', err)
    return new Response('OK', { status: 200 })
  }
})

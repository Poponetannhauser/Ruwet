import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTelegramMessage, escapeHtml, formatBoardLink } from '../_shared/telegram.ts'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (webhookSecret) {
    const receivedSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (receivedSecret !== webhookSecret) {
      console.warn('Unauthorized webhook call: missing or invalid secret token header')
      return new Response('Unauthorized', { status: 401 })
    }
  }

  if (!botToken || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables for telegram-webhook')
    return new Response('Server Configuration Error', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const update = await req.json()
    const message = update?.message
    if (!message || !message.chat || !message.text) {
      return new Response('OK', { status: 200 })
    }

    const chatId = message.chat.id
    const text: string = message.text.trim()
    const command = text.split(' ')[0].toLowerCase()

    switch (command) {
      case '/start':
        await handleStartCommand(chatId, text, botToken, supabase)
        break
      case '/mytasks':
        await handleMyTasksCommand(chatId, botToken, supabase)
        break
      case '/stale':
        await handleStaleCommand(chatId, botToken, supabase)
        break
      case '/task':
        await handleTaskCommand(chatId, text, botToken, supabase)
        break
      case '/help':
        await handleHelpCommand(chatId, botToken)
        break
      default:
        if (text.startsWith('/')) {
          await sendTelegramMessage(botToken, {
            chat_id: chatId,
            text: '❓ <b>Perintah tidak dikenali.</b>\nKetik /help untuk melihat daftar perintah yang tersedia.',
            parse_mode: 'HTML',
          })
        }
        break
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response('OK', { status: 200 })
  }
})

// Helper to find profile by telegram_chat_id
async function getProfileByChatId(chatId: number, supabase: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle()
  return profile
}

// Helper to get board IDs accessible to user
async function getUserBoardIds(userId: string, supabase: any): Promise<string[]> {
  const { data: memberBoards } = await supabase
    .from('board_members')
    .select('board_id')
    .eq('user_id', userId)

  const { data: ownerBoards } = await supabase
    .from('boards')
    .select('id')
    .eq('owner_id', userId)

  const boardIds = new Set<string>()
  memberBoards?.forEach((b: any) => boardIds.add(b.board_id))
  ownerBoards?.forEach((b: any) => boardIds.add(b.id))
  return Array.from(boardIds)
}

// Handler for /start <token>
async function handleStartCommand(chatId: number, text: string, botToken: string, supabase: any) {
  const parts = text.split(' ')
  const token = parts[1]?.trim()

  if (!token) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '👋 <b>Selamat datang di Ruwet Bot!</b>\n\nUntuk menghubungkan akun Ruwet Anda, buka menu Settings di aplikasi web Ruwet dan klik tombol <b>Connect Telegram</b>.',
      parse_mode: 'HTML',
    })
    return
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, telegram_link_expires_at')
    .eq('telegram_link_token', token)
    .maybeSingle()

  if (error || !profile) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '❌ <b>Token tautan tidak valid.</b>\n\nSilakan buka Settings di aplikasi web Ruwet untuk membuat tautan baru.',
      parse_mode: 'HTML',
    })
    return
  }

  if (profile.telegram_link_expires_at && new Date(profile.telegram_link_expires_at) < new Date()) {
    await supabase
      .from('profiles')
      .update({ telegram_link_token: null, telegram_link_expires_at: null })
      .eq('id', profile.id)

    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '❌ <b>Token tautan telah kadaluarsa (berlaku 10 menit).</b>\n\nSilakan buat tautan baru dari menu Settings di aplikasi web Ruwet.',
      parse_mode: 'HTML',
    })
    return
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      telegram_chat_id: String(chatId),
      telegram_link_token: null,
      telegram_link_expires_at: null,
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('Failed to update telegram_chat_id:', updateError)
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '❌ <b>Gagal menghubungkan akun.</b> Silakan coba lagi nanti.',
      parse_mode: 'HTML',
    })
    return
  }

  await sendTelegramMessage(botToken, {
    chat_id: chatId,
    text: `✅ <b>Berhasil terhubung!</b>\n\nAkun Telegram Anda telah dikaitkan dengan akun Ruwet <b>${profile.full_name}</b>. Ketik /help untuk melihat daftar perintah.`,
    parse_mode: 'HTML',
  })
}

// Task B3: Handler for /mytasks
async function handleMyTasksCommand(chatId: number, botToken: string, supabase: any) {
  const profile = await getProfileByChatId(chatId, supabase)
  if (!profile) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '⚠️ <b>Akun Telegram Anda belum terhubung ke Ruwet.</b>\nSilakan klik tombol <b>Connect Telegram</b> pada menu Settings di aplikasi web.',
      parse_mode: 'HTML',
    })
    return
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, task_number, title, due_date, board_id, boards(name), column_id, columns(name)')
    .eq('assignee_id', profile.id)
    .order('created_at', { ascending: false })

  const activeTasks = (tasks || []).filter(
    (t: any) => t.columns?.name?.trim()?.toLowerCase() !== 'done'
  )

  if (activeTasks.length === 0) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: `🎉 <b>Tidak ada tugas aktif yang ditugaskan kepada Anda saat ini.</b>`,
      parse_mode: 'HTML',
    })
    return
  }

  let text = `📋 <b>Tugas Anda (${activeTasks.length}):</b>\n\n`
  activeTasks.forEach((t: any) => {
    const num = t.task_number !== null && t.task_number !== undefined ? `#${t.task_number} ` : ''
    const boardName = t.boards?.name ? escapeHtml(t.boards.name) : 'Board'
    const colName = t.columns?.name ? escapeHtml(t.columns.name) : 'Status'
    const link = formatBoardLink(t.board_id)

    text += `• <b>${num}${escapeHtml(t.title)}</b>\n`
    text += `  └ Board: <i>${boardName}</i> | Status: <i>${colName}</i>\n`
    text += `  🔗 <a href="${link}">Buka Board</a>\n\n`
  })

  await sendTelegramMessage(botToken, {
    chat_id: chatId,
    text: text.trim(),
    parse_mode: 'HTML',
  })
}

// Task B4: Handler for /stale
async function handleStaleCommand(chatId: number, botToken: string, supabase: any) {
  const profile = await getProfileByChatId(chatId, supabase)
  if (!profile) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '⚠️ <b>Akun Telegram Anda belum terhubung ke Ruwet.</b>\nSilakan klik tombol <b>Connect Telegram</b> pada menu Settings di aplikasi web.',
      parse_mode: 'HTML',
    })
    return
  }

  const boardIds = await getUserBoardIds(profile.id, supabase)
  if (boardIds.length === 0) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '⚠️ Anda belum bergabung ke board manapun.',
      parse_mode: 'HTML',
    })
    return
  }

  const { data: boards } = await supabase
    .from('boards')
    .select('id, name, stale_threshold_hours')
    .in('id', boardIds)

  const boardMap = new Map<string, { name: string; threshold: number }>()
  boards?.forEach((b: any) => {
    boardMap.set(b.id, {
      name: b.name,
      threshold: b.stale_threshold_hours || 48,
    })
  })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, task_number, title, board_id, status_updated_at, assignee_id, profiles:assignee_id(full_name), columns(name)')
    .in('board_id', boardIds)
    .not('assignee_id', 'is', null)

  const nowMs = Date.now()
  const staleList: any[] = []

  tasks?.forEach((t: any) => {
    if (t.columns?.name?.trim()?.toLowerCase() === 'done') return
    if (!t.status_updated_at) return

    const bInfo = boardMap.get(t.board_id)
    if (!bInfo) return

    const updatedMs = new Date(t.status_updated_at).getTime()
    const diffHours = (nowMs - updatedMs) / (1000 * 60 * 60)

    if (diffHours >= bInfo.threshold) {
      staleList.push({
        ...t,
        boardName: bInfo.name,
        hoursStale: Math.floor(diffHours),
        assigneeName: t.profiles?.full_name || 'Seseorang',
      })
    }
  })

  if (staleList.length === 0) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '✅ <b>Semua tugas di board Anda dalam keadaan aktif (tidak ada yang stale).</b>',
      parse_mode: 'HTML',
    })
    return
  }

  let text = `⚠️ <b>Tugas Stale (${staleList.length}):</b>\n\n`
  staleList.forEach((t: any) => {
    const num = t.task_number !== null && t.task_number !== undefined ? `#${t.task_number} ` : ''
    const link = formatBoardLink(t.board_id)

    text += `• <b>${num}${escapeHtml(t.title)}</b>\n`
    text += `  └ Board: <i>${escapeHtml(t.boardName)}</i> | Assignee: <i>${escapeHtml(t.assigneeName)}</i> | &gt;${t.hoursStale}j\n`
    text += `  🔗 <a href="${link}">Buka Board</a>\n\n`
  })

  await sendTelegramMessage(botToken, {
    chat_id: chatId,
    text: text.trim(),
    parse_mode: 'HTML',
  })
}

// Task B5: Handler for /task <number/keyword>
async function handleTaskCommand(chatId: number, text: string, botToken: string, supabase: any) {
  const profile = await getProfileByChatId(chatId, supabase)
  if (!profile) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '⚠️ <b>Akun Telegram Anda belum terhubung ke Ruwet.</b>\nSilakan klik tombol <b>Connect Telegram</b> pada menu Settings di aplikasi web.',
      parse_mode: 'HTML',
    })
    return
  }

  const query = text.substring('/task'.length).trim()
  if (!query) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '💡 <b>Penggunaan:</b> <code>/task #1</code> atau <code>/task keyword</code>',
      parse_mode: 'HTML',
    })
    return
  }

  const boardIds = await getUserBoardIds(profile.id, supabase)
  if (boardIds.length === 0) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: '⚠️ Anda belum bergabung ke board manapun.',
      parse_mode: 'HTML',
    })
    return
  }

  const numMatch = query.match(/^#?(\d+)$/)
  let results: any[] = []

  if (numMatch) {
    const taskNum = parseInt(numMatch[1], 10)
    const { data } = await supabase
      .from('tasks')
      .select('id, task_number, title, description, due_date, board_id, boards(name), column_id, columns(name), assignee_id, profiles:assignee_id(full_name)')
      .in('board_id', boardIds)
      .eq('task_number', taskNum)

    results = data || []
  } else {
    const { data } = await supabase
      .from('tasks')
      .select('id, task_number, title, description, due_date, board_id, boards(name), column_id, columns(name), assignee_id, profiles:assignee_id(full_name)')
      .in('board_id', boardIds)
      .ilike('title', `%${query}%`)
      .limit(10)

    results = data || []
  }

  if (results.length === 0) {
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: `❌ <b>Tugas tidak ditemukan</b> untuk pencarian "<code>${escapeHtml(query)}</code>".`,
      parse_mode: 'HTML',
    })
    return
  }

  // Disambiguation (>1 results)
  if (results.length > 1) {
    let text = `🔍 <b>Ditemukan (${results.length}) tugas yang cocok:</b>\n\n`
    results.forEach((t: any) => {
      const num = t.task_number !== null && t.task_number !== undefined ? `#${t.task_number} ` : ''
      const boardName = t.boards?.name ? escapeHtml(t.boards.name) : 'Board'
      text += `• <b>${num}${escapeHtml(t.title)}</b> (Board: <i>${boardName}</i>)\n`
    })
    text += `\n💡 Ketik <code>/task #nomor</code> untuk melihat detail tugas spesifik.`

    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: text.trim(),
      parse_mode: 'HTML',
    })
    return
  }

  // 1 Exact Result: Send Detailed Card
  const t = results[0]
  const numStr = t.task_number !== null && t.task_number !== undefined ? `#${t.task_number} ` : ''
  const boardName = t.boards?.name ? escapeHtml(t.boards.name) : 'Board'
  const colName = t.columns?.name ? escapeHtml(t.columns.name) : 'Status'
  const assigneeName = t.profiles?.full_name ? escapeHtml(t.profiles.full_name) : 'Belum ditugaskan'
  const dueDateStr = t.due_date ? new Date(t.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanpa tenggat'
  const descStr = t.description ? escapeHtml(t.description) : '<i>Tidak ada deskripsi</i>'
  const link = formatBoardLink(t.board_id)

  const cardText =
    `📌 <b>${numStr}${escapeHtml(t.title)}</b>\n\n` +
    `🏢 <b>Board:</b> ${boardName}\n` +
    `📊 <b>Status:</b> ${colName}\n` +
    `👤 <b>Assignee:</b> ${assigneeName}\n` +
    `📅 <b>Tenggat:</b> ${dueDateStr}\n\n` +
    `📝 <b>Deskripsi:</b>\n${descStr}\n\n` +
    `🔗 <a href="${link}">Buka Task di Board</a>`

  await sendTelegramMessage(botToken, {
    chat_id: chatId,
    text: cardText,
    parse_mode: 'HTML',
  })
}

// Handler for /help
async function handleHelpCommand(chatId: number, botToken: string) {
  const helpText =
    `🤖 <b>Bantuan Ruwet Bot</b>\n\n` +
    `Perintah yang tersedia:\n` +
    `• /mytasks - Tampilkan semua tugas yang diberikan kepada Anda\n` +
    `• /stale - Tampilkan tugas yang belum diperbarui (stale)\n` +
    `• /task &lt;nomor/keyword&gt; - Cari detail tugas berdasar nomor (#1) atau judul\n` +
    `• /help - Tampilkan pesan bantuan ini`

  await sendTelegramMessage(botToken, {
    chat_id: chatId,
    text: helpText,
    parse_mode: 'HTML',
  })
}

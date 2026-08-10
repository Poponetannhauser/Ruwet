import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTelegramMessage } from '../_shared/telegram.ts'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  // Validate secret token header if TELEGRAM_WEBHOOK_SECRET is configured
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

    // Command Router Dispatcher
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
        // Respond to unrecognized slash commands
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

// Handler for /mytasks (stub to be filled in B3)
async function handleMyTasksCommand(chatId: number, botToken: string, supabase: any) {
  // To be implemented in Task B3
}

// Handler for /stale (stub to be filled in B4)
async function handleStaleCommand(chatId: number, botToken: string, supabase: any) {
  // To be implemented in Task B4
}

// Handler for /task (stub to be filled in B5)
async function handleTaskCommand(chatId: number, text: string, botToken: string, supabase: any) {
  // To be implemented in Task B5
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

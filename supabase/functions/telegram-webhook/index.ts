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

    // Handle /start command
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const token = parts[1]?.trim()

      if (!token) {
        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '👋 <b>Selamat datang di Ruwet Bot!</b>\n\nUntuk menghubungkan akun Ruwet Anda, buka menu Settings di aplikasi web Ruwet dan klik tombol <b>Connect Telegram</b>.',
          parse_mode: 'HTML',
        })
        return new Response('OK', { status: 200 })
      }

      // Look up profile by telegram_link_token
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
        return new Response('OK', { status: 200 })
      }

      // Check expiration
      if (profile.telegram_link_expires_at && new Date(profile.telegram_link_expires_at) < new Date()) {
        // Clear expired token
        await supabase
          .from('profiles')
          .update({ telegram_link_token: null, telegram_link_expires_at: null })
          .eq('id', profile.id)

        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '❌ <b>Token tautan telah kadaluarsa (berlaku 10 menit).</b>\n\nSilakan buat tautan baru dari menu Settings di aplikasi web Ruwet.',
          parse_mode: 'HTML',
        })
        return new Response('OK', { status: 200 })
      }

      // Link chat_id to profile and clear single-use token
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
        return new Response('OK', { status: 200 })
      }

      await sendTelegramMessage(botToken, {
        chat_id: chatId,
        text: `✅ <b>Berhasil terhubung!</b>\n\nAkun Telegram Anda telah dikaitkan dengan akun Ruwet <b>${profile.full_name}</b>. Anda akan menerima notifikasi tugas di sini.`,
        parse_mode: 'HTML',
      })
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response('OK', { status: 200 })
  }
})

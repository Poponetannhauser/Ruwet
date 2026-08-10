import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate 32-character secure random token
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now

    const adminSupabase = createAdminClient()
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        telegram_link_token: token,
        telegram_link_expires_at: expiresAt,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Gagal menyimpan telegram_link_token:', updateError)
      return NextResponse.json({ error: 'Gagal membuat token tautan Telegram' }, { status: 500 })
    }

    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'RuwetBot'
    const deepLink = `https://t.me/${botName}?start=${token}`

    return NextResponse.json({
      token,
      expires_at: expiresAt,
      bot_name: botName,
      deep_link: deepLink,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

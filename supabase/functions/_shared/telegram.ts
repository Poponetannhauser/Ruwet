// Helper module for Telegram Bot API interactions (Deno Runtime)

export interface TelegramMessageOptions {
  chat_id: string | number
  text: string
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown'
  reply_markup?: unknown
}

export async function sendTelegramMessage(botToken: string, options: TelegramMessageOptions): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error('Telegram sendMessage error:', data)
      return false
    }
    return true
  } catch (err) {
    console.error('Failed to send Telegram message:', err)
    return false
  }
}

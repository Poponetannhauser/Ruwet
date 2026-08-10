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

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatBoardLink(boardId: string): string {
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'
  return `${appBaseUrl}/boards/${boardId}`
}

export function formatAssignNotification(params: {
  taskTitle: string
  boardName: string
  taskLink?: string
}): string {
  const link = params.taskLink ? `\n\n🔗 <a href="${params.taskLink}">Buka Task di Ruwet</a>` : ''
  return `📌 <b>Tugas Baru Diberikan!</b>\n\n` +
         `Anda telah ditugaskan pada task <b>${escapeHtml(params.taskTitle)}</b> di board <b>${escapeHtml(params.boardName)}</b>.${link}`
}

export function formatStaleNotification(params: {
  taskTitle: string
  boardName: string
  hoursStale: number
  taskLink?: string
}): string {
  const link = params.taskLink ? `\n\n🔗 <a href="${params.taskLink}">Buka Task di Ruwet</a>` : ''
  return `⚠️ <b>Tugas Stale (Perlu Perhatian)!</b>\n\n` +
         `Task <b>${escapeHtml(params.taskTitle)}</b> di board <b>${escapeHtml(params.boardName)}</b> belum mengalami pembaruan status selama &gt;${params.hoursStale} jam.${link}`
}

export async function logTelegramMetric(
  supabase: any,
  eventType: string,
  chatId?: string | number,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabase.from('telegram_metrics').insert({
      event_type: eventType,
      chat_id: chatId ? String(chatId) : null,
      metadata,
    })
  } catch (err) {
    console.error('Failed to log telegram metric:', err)
  }
}

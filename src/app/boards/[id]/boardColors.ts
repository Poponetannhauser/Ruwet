/**
 * Color system helpers for Column Status, Category, and Phase badges.
 * Provides harmonized dark-mode color palettes with high contrast and sleek styling.
 */

export function getColumnBadgeStyle(columnName: string): string {
  const lower = columnName.toLowerCase().trim()

  if (lower.includes('done') || lower.includes('selesai') || lower.includes('complete') || lower.includes('release')) {
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
  }
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('dev') || lower.includes('kerja')) {
    return 'bg-sky-950/70 text-sky-300 border-sky-800/60'
  }
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test') || lower.includes('check')) {
    return 'bg-amber-950/70 text-amber-300 border-amber-800/60'
  }
  if (lower.includes('block') || lower.includes('bug') || lower.includes('hold')) {
    return 'bg-rose-950/70 text-rose-300 border-rose-800/60'
  }
  // Default (To Do, Backlog, Ideas, etc.)
  return 'bg-zinc-800/90 text-zinc-300 border-zinc-700/60'
}

export function getCategoryBadgeStyle(category: string | null | undefined): string {
  if (!category) return 'bg-zinc-800/60 text-zinc-500 border-zinc-700/40'

  const lower = category.toLowerCase().trim()

  if (lower.includes('program') || lower.includes('dev') || lower.includes('code') || lower.includes('tech')) {
    return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
  }
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
    return 'bg-purple-950/60 text-purple-300 border-purple-800/50'
  }
  if (lower.includes('art') || lower.includes('asset') || lower.includes('visual')) {
    return 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/50'
  }
  if (lower.includes('audio') || lower.includes('sfx') || lower.includes('sound') || lower.includes('music')) {
    return 'bg-rose-950/60 text-rose-300 border-rose-800/50'
  }
  if (lower.includes('content') || lower.includes('writ') || lower.includes('copy') || lower.includes('doc')) {
    return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50'
  }
  if (lower.includes('qa') || lower.includes('test') || lower.includes('bug')) {
    return 'bg-amber-950/60 text-amber-300 border-amber-800/50'
  }
  if (lower.includes('market') || lower.includes('ops') || lower.includes('biz')) {
    return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50'
  }

  // Fallback to blue/slate
  return 'bg-blue-950/50 text-blue-300 border-blue-800/40'
}

export function getPhaseBadgeStyle(phase: string | null | undefined): string {
  if (!phase) return 'bg-zinc-800/60 text-zinc-500 border-zinc-700/40'

  const lower = phase.toLowerCase().trim()

  if (lower.includes('proto') || lower.includes('mvp') || lower.includes('ide')) {
    return 'bg-violet-950/70 text-violet-300 border-violet-800/50'
  }
  if (lower.includes('core') || lower.includes('prod') || lower.includes('build')) {
    return 'bg-blue-950/70 text-blue-300 border-blue-800/50'
  }
  if (lower.includes('content')) {
    return 'bg-teal-950/70 text-teal-300 border-teal-800/50'
  }
  if (lower.includes('polish') || lower.includes('refine')) {
    return 'bg-pink-950/70 text-pink-300 border-pink-800/50'
  }
  if (lower.includes('test') || lower.includes('qa') || lower.includes('audit')) {
    return 'bg-amber-950/70 text-amber-300 border-amber-800/50'
  }
  if (lower.includes('release') || lower.includes('launch') || lower.includes('live')) {
    return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50'
  }

  return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
}

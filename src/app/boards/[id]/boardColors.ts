/**
 * Color system helpers for Column Status, Category, and Phase badges.
 * Provides subtle, muted, Linear-style dark mode color palettes.
 */

export function getColumnBadgeStyle(columnName: string): string {
  const lower = columnName.toLowerCase().trim()

  if (lower.includes('done') || lower.includes('selesai') || lower.includes('complete') || lower.includes('release')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('dev') || lower.includes('kerja')) {
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  }
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test') || lower.includes('check')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  if (lower.includes('block') || lower.includes('bug') || lower.includes('hold')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }
  // Default (To Do, Backlog, Ideas, etc.)
  return 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50'
}

export function getCategoryBadgeStyle(category: string | null | undefined): string {
  if (!category) return 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'

  const lower = category.toLowerCase().trim()

  if (lower.includes('program') || lower.includes('dev') || lower.includes('code') || lower.includes('tech')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
  if (lower.includes('art') || lower.includes('asset') || lower.includes('visual')) {
    return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
  }
  if (lower.includes('audio') || lower.includes('sfx') || lower.includes('sound') || lower.includes('music')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }
  if (lower.includes('content') || lower.includes('writ') || lower.includes('copy') || lower.includes('doc')) {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  }
  if (lower.includes('qa') || lower.includes('test') || lower.includes('bug')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  if (lower.includes('market') || lower.includes('ops') || lower.includes('biz')) {
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }

  // Fallback to neutral slate
  return 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50'
}

export function getPhaseBadgeStyle(phase: string | null | undefined): string {
  if (!phase) return 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'

  const lower = phase.toLowerCase().trim()

  if (lower.includes('proto') || lower.includes('mvp') || lower.includes('ide')) {
    return 'bg-violet-500/10 text-violet-400 border-violet-500/20'
  }
  if (lower.includes('core') || lower.includes('prod') || lower.includes('build')) {
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }
  if (lower.includes('content')) {
    return 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  }
  if (lower.includes('polish') || lower.includes('refine')) {
    return 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  }
  if (lower.includes('test') || lower.includes('qa') || lower.includes('audit')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  if (lower.includes('release') || lower.includes('launch') || lower.includes('live')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }

  return 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50'
}

/**
 * Sanitizes phase strings by removing numeric prefixes and boilerplate
 * e.g. "0 - Prototype", "0. Prototype", "Phase 0 - Prototype", "[0] Prototype" -> "Prototype"
 */
export function sanitizePhase(phase: string | null | undefined): string | null {
  if (!phase) return null
  let p = phase.trim()
  if (!p) return null

  p = p
    .replace(/^(?:phase|fase|stage)\s*\d+[\s\-_:.)\]]+/i, '')
    .replace(/^\[\s*\d+\s*\][\s\-_:.)]*/, '')
    .replace(/^\(\s*\d+\s*\)[\s\-_:.)]*/, '')
    .replace(/^\d+[\s\-_:.)]+/, '')
    .trim()

  return p || null
}

export type StaleResult = {
  status: 'green' | 'yellow' | 'red'
  label: string
  elapsedText: string
  diffMs: number
  ratio: number
} | null

/**
 * Calculates staleness status for a task based on last update timestamp and board threshold
 */
export function calculateStaleStatus(
  task: {
    status_updated_at?: string | null
    updated_at?: string | null
    created_at?: string | null
    column_id: string
  },
  columns: Array<{ id: string; name: string }>,
  staleThresholdHours: number = 48,
  nowMs: number = Date.now()
): StaleResult {
  const currentColumn = columns.find((c) => c.id === task.column_id)
  const colName = currentColumn?.name?.trim().toLowerCase() || ''
  const isDoneColumn =
    colName === 'done' ||
    colName === 'selesai' ||
    colName === 'completed' ||
    colName === 'release' ||
    colName === 'archive'

  if (isDoneColumn) return null

  const timestampStr = task.status_updated_at || task.updated_at || task.created_at
  if (!timestampStr) return null

  const updatedMs = new Date(timestampStr).getTime()
  if (isNaN(updatedMs) || updatedMs <= 0) return null

  const diffMs = Math.max(0, nowMs - updatedMs)
  const thresholdMs = staleThresholdHours * 60 * 60 * 1000

  const ratio = diffMs / thresholdMs

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let elapsedText = ''
  if (diffDays > 0) {
    elapsedText = `${diffDays}h`
  } else if (diffHours > 0) {
    elapsedText = `${diffHours}j`
  } else {
    elapsedText = `${diffMinutes}m`
  }

  if (ratio >= 1.0) {
    return {
      status: 'red',
      label: `Stale (${elapsedText})`,
      elapsedText,
      diffMs,
      ratio,
    }
  } else if (ratio >= 0.75) {
    return {
      status: 'yellow',
      label: `Warning (${elapsedText})`,
      elapsedText,
      diffMs,
      ratio,
    }
  } else {
    return {
      status: 'green',
      label: `Active (${elapsedText})`,
      elapsedText,
      diffMs,
      ratio,
    }
  }
}

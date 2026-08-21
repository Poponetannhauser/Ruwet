'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { createBatchTasks, type BatchTaskItem } from './taskActions'
import { parseCsv } from './docs/CsvTableView'

type Column = {
  id: string
  name: string
}

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
  } | null
}

type BatchTaskModalProps = {
  boardId: string
  columns: Column[]
  members: Member[]
}

export function BatchTaskModal({ boardId, columns, members: _members }: BatchTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'paste' | 'csv'>('paste')

  // Shared form state
  const [selectedColumnId, setSelectedColumnId] = useState(columns[0]?.id || '')
  const [defaultPriority, setDefaultPriority] = useState('P2')
  const [defaultCategory, setDefaultCategory] = useState('')
  const [defaultPhase, setDefaultPhase] = useState('')

  // Tab 1: Paste Text
  const [rawText, setRawText] = useState('')

  // Tab 2: CSV Upload
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [csvParsedRows, setCsvParsedRows] = useState<string[][]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (columns.length > 0 && !selectedColumnId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedColumnId(columns[0].id)
    }
  }, [columns, selectedColumnId])

  // Parse lines from rawText
  const parsedPasteTasks = useMemo<BatchTaskItem[]>(() => {
    if (!rawText.trim()) return []
    const lines = rawText.split('\n')
    const items: BatchTaskItem[] = []

    for (const line of lines) {
      let trimmed = line.trim()
      if (!trimmed) continue

      // Strip markdown checklist / bullet prefix: - [ ], [ ], - , * , 1.
      trimmed = trimmed
        .replace(/^-\s*\[[ xX]\]\s*/, '')
        .replace(/^\[[ xX]\]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .replace(/^\d+[\.)]\s*/, '')
        .trim()

      if (trimmed) {
        items.push({
          title: trimmed,
          priority: defaultPriority,
          category: defaultCategory || null,
          phase: defaultPhase || null,
        })
      }
    }
    return items
  }, [rawText, defaultPriority, defaultCategory, defaultPhase])

  // Parse tasks from CSV
  const parsedCsvTasks = useMemo<BatchTaskItem[]>(() => {
    if (csvParsedRows.length < 2) return []

    const headerRow = csvParsedRows[0].map((h) => h.toLowerCase().trim())
    const titleIdx = headerRow.findIndex(
      (h) => h.includes('title') || h.includes('judul') || h.includes('task') || h.includes('nama')
    )
    const prioIdx = headerRow.findIndex(
      (h) => h.includes('prio') || h.includes('priority') || h.includes('urgency')
    )
    const catIdx = headerRow.findIndex(
      (h) => h.includes('cat') || h.includes('kategori') || h.includes('category')
    )
    const phaseIdx = headerRow.findIndex(
      (h) => h.includes('phase') || h.includes('fase') || h.includes('stage')
    )
    const descIdx = headerRow.findIndex(
      (h) => h.includes('desc') || h.includes('deskripsi') || h.includes('detail')
    )
    const dueIdx = headerRow.findIndex(
      (h) => h.includes('due') || h.includes('tenggat') || h.includes('deadline') || h.includes('date')
    )

    const actualTitleIdx = titleIdx !== -1 ? titleIdx : 0

    const items: BatchTaskItem[] = []
    const rows = csvParsedRows.slice(1)

    for (const row of rows) {
      const rawTitle = (row[actualTitleIdx] || '').trim()
      if (!rawTitle) continue

      items.push({
        title: rawTitle,
        priority: prioIdx !== -1 && row[prioIdx] ? row[prioIdx] : defaultPriority,
        category: catIdx !== -1 && row[catIdx] ? row[catIdx] : defaultCategory || null,
        phase: phaseIdx !== -1 && row[phaseIdx] ? row[phaseIdx] : defaultPhase || null,
        description: descIdx !== -1 && row[descIdx] ? row[descIdx] : null,
        due_date: dueIdx !== -1 && row[dueIdx] ? row[dueIdx] : null,
      })
    }

    return items
  }, [csvParsedRows, defaultPriority, defaultCategory, defaultPhase])

  async function handleCsvFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Harap pilih file dengan format .csv')
      return
    }
    setError(null)
    setCsvFileName(file.name)
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setError('File CSV kosong atau tidak memiliki data yang valid.')
      } else {
        setCsvParsedRows(parsed)
      }
    } catch {
      setError('Gagal membaca file CSV.')
    }
  }

  async function handleSubmit() {
    setError(null)
    setSuccessCount(null)

    const tasksToCreate = activeTab === 'paste' ? parsedPasteTasks : parsedCsvTasks

    if (tasksToCreate.length === 0) {
      setError(
        activeTab === 'paste'
          ? 'Belum ada baris task yang diinputkan.'
          : 'Belum ada data task yang valid di file CSV.'
      )
      return
    }

    if (!selectedColumnId) {
      setError('Harap pilih kolom tujuan.')
      return
    }

    setLoading(true)

    const res = await createBatchTasks(boardId, selectedColumnId, tasksToCreate)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      setSuccessCount(res.count || tasksToCreate.length)
      setTimeout(() => {
        setIsOpen(false)
        setSuccessCount(null)
        setRawText('')
        setCsvFileName(null)
        setCsvParsedRows([])
      }, 1200)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-2 shadow-xs"
        title="Import atau Tambah Banyak Task Sekaligus"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span>Import Tasks</span>
        <span className="rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono shadow-2xs">
          Beta
        </span>
      </button>

      {mounted && typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-[#2C2C30] shadow-2xl border border-zinc-800/80 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-[#25252a]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            Import &amp; Batch Add Tasks
                          </h3>
                          <span className="rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            Beta
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Buat banyak task sekaligus dari teks atau file CSV
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Body & Tabs */}
                  <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {/* Tab Selection */}
                    <div className="flex rounded-lg bg-[#1c1c22] p-1 border border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setActiveTab('paste')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-2 ${
                          activeTab === 'paste'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Paste List / Text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('csv')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-2 ${
                          activeTab === 'csv'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                        </svg>
                        <span>Upload File CSV</span>
                      </button>
                    </div>

                    {/* Shared Target Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#232328] p-3.5 rounded-lg border border-zinc-800/80">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Kolom Tujuan <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={selectedColumnId}
                          onChange={(e) => setSelectedColumnId(e.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-medium"
                        >
                          {columns.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Default Prioritas
                        </label>
                        <select
                          value={defaultPriority}
                          onChange={(e) => setDefaultPriority(e.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-medium"
                        >
                          <option value="P0">P0 - Blocker</option>
                          <option value="P1">P1 - High</option>
                          <option value="P2">P2 - Medium</option>
                          <option value="P3">P3 - Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Default Kategori
                        </label>
                        <input
                          type="text"
                          list="batch-category-suggestions"
                          value={defaultCategory}
                          onChange={(e) => setDefaultCategory(e.target.value)}
                          placeholder="e.g. Development, Design"
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <datalist id="batch-category-suggestions">
                          <option value="Development" />
                          <option value="Design" />
                          <option value="Art & Assets" />
                          <option value="Audio" />
                          <option value="Content" />
                          <option value="QA & Testing" />
                          <option value="Marketing" />
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Default Fase
                        </label>
                        <input
                          type="text"
                          list="batch-phase-suggestions"
                          value={defaultPhase}
                          onChange={(e) => setDefaultPhase(e.target.value)}
                          placeholder="e.g. Prototype, Polish"
                          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <datalist id="batch-phase-suggestions">
                          <option value="Prototype" />
                          <option value="Core Production" />
                          <option value="Content" />
                          <option value="Polish" />
                          <option value="Testing" />
                          <option value="Release" />
                        </datalist>
                      </div>
                    </div>

                    {/* Tab 1: Paste Content */}
                    {activeTab === 'paste' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-200">
                            Daftar Baris Task (1 baris = 1 task)
                          </label>
                          <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                            {parsedPasteTasks.length} task terdeteksi
                          </span>
                        </div>
                        <textarea
                          rows={8}
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder={`Paste to-do list / checklist Anda di sini:\n- [ ] Buat skema database tabel users\n- [ ] Integrasi auth Google & Email\n- [ ] Desain wireframe dashboard\n- [ ] Setup cron reminder stale task`}
                          className="w-full font-mono text-xs rounded-lg border border-zinc-700 bg-zinc-900/90 p-3 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                        />
                        <p className="text-[11px] text-zinc-500">
                          Format checklist seperti &quot;- [ ]&quot;, bullet points, atau nomor urut akan dibersihkan secara otomatis.
                        </p>
                      </div>
                    )}

                    {/* Tab 2: CSV Upload Content */}
                    {activeTab === 'csv' && (
                      <div className="space-y-3">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                            if (e.dataTransfer.files?.[0]) {
                              handleCsvFile(e.dataTransfer.files[0])
                            }
                          }}
                          className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                            isDragging
                              ? 'border-indigo-500 bg-indigo-950/20'
                              : 'border-zinc-700/80 bg-[#1c1c24]/80 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div className="text-xs text-zinc-300 font-medium">
                              <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-bold">
                                <span>Pilih file CSV</span>
                                <input
                                  type="file"
                                  accept=".csv"
                                  className="sr-only"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleCsvFile(e.target.files[0])
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-zinc-500"> atau drag and drop ke sini</span>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              Header yang didukung: Title / Judul, Priority, Category, Phase, Description
                            </p>
                          </div>
                        </div>

                        {csvFileName && (
                          <div className="rounded-lg bg-[#232328] border border-zinc-800 p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{csvFileName}</span>
                              </div>
                              <span className="font-mono text-indigo-400">
                                {parsedCsvTasks.length} task siap di-import
                              </span>
                            </div>

                            {/* Preview first 3-5 rows */}
                            {parsedCsvTasks.length > 0 && (
                              <div className="max-h-36 overflow-x-auto rounded border border-zinc-700/60 text-[11px] font-mono">
                                <table className="w-full text-left">
                                  <thead className="bg-[#18181c] text-zinc-400 border-b border-zinc-700/80">
                                    <tr>
                                      <th className="py-1 px-2">#</th>
                                      <th className="py-1 px-2">Judul Task</th>
                                      <th className="py-1 px-2">Prioritas</th>
                                      <th className="py-1 px-2">Kategori</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                    {parsedCsvTasks.slice(0, 4).map((t, idx) => (
                                      <tr key={idx}>
                                        <td className="py-1 px-2 text-zinc-500">{idx + 1}</td>
                                        <td className="py-1 px-2 truncate max-w-[200px]">{t.title}</td>
                                        <td className="py-1 px-2 font-bold">{t.priority}</td>
                                        <td className="py-1 px-2 text-zinc-400">{t.category || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Messages */}
                    {error && (
                      <div className="rounded-lg bg-rose-950/40 border border-rose-800/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    {successCount !== null && (
                      <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Berhasil membuat <strong>{successCount}</strong> task baru ke kolom tujuan!</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 px-5 py-3.5 bg-[#25252a]">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={loading}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        (activeTab === 'paste' && parsedPasteTasks.length === 0) ||
                        (activeTab === 'csv' && parsedCsvTasks.length === 0)
                      }
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs flex items-center gap-2"
                    >
                      {loading && (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      )}
                      <span>
                        {loading
                          ? 'Memproses...'
                          : `Import ${
                              activeTab === 'paste'
                                ? parsedPasteTasks.length > 0
                                  ? `${parsedPasteTasks.length} Tasks`
                                  : 'Tasks'
                                : parsedCsvTasks.length > 0
                                ? `${parsedCsvTasks.length} Tasks`
                                : 'Tasks'
                            }`}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

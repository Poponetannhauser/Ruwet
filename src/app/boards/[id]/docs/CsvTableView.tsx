'use client'

import { useState, useMemo } from 'react'

type CsvTableViewProps = {
  content: string
  fileName?: string | null
}

/**
 * Parses raw CSV string into a 2D array of strings.
 * Handles quoted fields, escaped quotes (""), and multiple delimiters (, ; \t).
 */
export function parseCsv(text: string): string[][] {
  if (!text || text.trim() === '') return []

  // Auto-detect delimiter from first line (default to comma)
  const firstLine = text.split(/\r\n|\n|\r/)[0] || ''
  let delimiter = ','
  const commaCount = (firstLine.match(/,/g) || []).length
  const semicolonCount = (firstLine.match(/;/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length

  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';'
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t'
  }

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"'
        i++
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell.trim())
      currentCell = ''
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // Handle \r\n or \n
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      currentRow.push(currentCell.trim())
      // Only push row if it contains non-empty cells
      if (currentRow.some((cell) => cell !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentCell = ''
    } else {
      currentCell += char
    }
  }

  // Flush remaining cell/row
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((cell) => cell !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

export function CsvTableView({ content }: CsvTableViewProps) {
  const [search, setSearch] = useState('')

  const data = useMemo(() => parseCsv(content), [content])

  const headers = useMemo(() => (data.length > 0 ? data[0] : []), [data])
  const rows = useMemo(() => (data.length > 1 ? data.slice(1) : []), [data])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const query = search.toLowerCase()
    return rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(query))
    )
  }, [rows, search])

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
        <svg className="w-10 h-10 mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs">File CSV kosong atau tidak memiliki data yang valid.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search & Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#232328] p-3 rounded-lg border border-zinc-800/80">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-zinc-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari data dalam tabel..."
            className="w-full pl-8 pr-7 py-1 text-xs rounded-md bg-[#18181b] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="bg-[#18181b] px-2 py-0.5 rounded border border-zinc-800">
            <strong className="text-zinc-200">{headers.length}</strong> Kolom
          </span>
          <span className="bg-[#18181b] px-2 py-0.5 rounded border border-zinc-800">
            <strong className="text-indigo-400">{filteredRows.length}</strong>
            {search && filteredRows.length !== rows.length ? ` / ${rows.length}` : ''} Baris
          </span>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="flex-1 overflow-auto rounded-lg border border-zinc-800/80 bg-[#1A1A1E] shadow-inner max-h-[calc(100vh-280px)]">
        <table className="w-full border-collapse text-left text-xs text-zinc-300 min-w-max">
          <thead className="sticky top-0 z-20 bg-[#25252b] border-b border-zinc-700/80 shadow-xs">
            <tr>
              <th className="py-2.5 px-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider w-12 text-center border-r border-zinc-800">
                #
              </th>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="py-2.5 px-3.5 font-bold text-zinc-100 text-xs border-r border-zinc-800 last:border-r-0 whitespace-nowrap"
                >
                  {header || `Kolom ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="odd:bg-[#1A1A1E] even:bg-[#1f1f25]/70 hover:bg-indigo-950/30 transition-colors"
                >
                  <td className="py-2 px-3 text-center text-zinc-500 text-[10px] border-r border-zinc-800/80 font-mono select-none">
                    {rowIdx + 1}
                  </td>
                  {headers.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="py-2 px-3.5 border-r border-zinc-800/80 last:border-r-0 text-zinc-200 whitespace-nowrap max-w-xs truncate"
                      title={row[colIdx] || ''}
                    >
                      {row[colIdx] !== undefined && row[colIdx] !== '' ? (
                        row[colIdx]
                      ) : (
                        <span className="text-zinc-600 italic">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="py-8 text-center text-zinc-500 text-xs italic"
                >
                  Tidak ada baris data yang cocok dengan &quot;{search}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

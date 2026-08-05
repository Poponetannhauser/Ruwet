export default function BoardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-950 text-zinc-100 bg-mesh font-sans">
      {/* Board Title Header Skeleton */}
      <div className="sticky top-0 z-30 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 shadow-md w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="h-7 w-44 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="h-6 w-28 rounded-md bg-zinc-800/60 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="h-8 w-28 rounded-lg bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Kanban Columns Skeleton */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-auto">
        <div className="flex gap-6 items-start">
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="w-80 flex-shrink-0 rounded-xl glass-panel p-4 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="h-5 w-28 rounded bg-zinc-800" />
                <div className="h-5 w-7 rounded-full bg-zinc-800" />
              </div>

              <div className="space-y-3">
                <div className="h-24 rounded-xl glass-card p-3.5 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-zinc-800" />
                  <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
                </div>
                <div className="h-28 rounded-xl glass-card p-3.5 space-y-2">
                  <div className="h-4 w-4/5 rounded bg-zinc-800" />
                  <div className="h-3 w-2/3 rounded bg-zinc-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


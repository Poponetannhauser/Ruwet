export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-950 text-zinc-100 bg-mesh font-sans">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-white/10 glass-panel px-6 sm:px-10 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-800 animate-pulse" />
            <div className="h-6 w-24 rounded-lg bg-zinc-800 animate-pulse" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-zinc-800 animate-pulse" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex flex-1 w-full max-w-7xl flex-col p-6 sm:p-10 mx-auto space-y-8">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-zinc-800/60 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-zinc-800 animate-pulse" />
        </div>

        {/* Boards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl glass-card p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-20 rounded bg-zinc-800" />
                <div className="h-6 w-3/4 rounded-lg bg-zinc-800" />
              </div>
              <div className="h-4 w-full rounded bg-zinc-800/50" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#1A1A1E] text-zinc-100 font-sans">
      {/* Left Sidebar Skeleton (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#2C2C30] border-r border-zinc-800/80 p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div className="h-8 w-8 rounded-lg bg-[#383840] animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-24 rounded bg-[#383840] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[#383840]/60 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="h-3 w-20 rounded bg-[#383840]/60 animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-[#383840] animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-[#383840]/40 animate-pulse" />
        </div>

        <div className="border-t border-zinc-800/80 pt-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#383840] animate-pulse" />
          <div className="space-y-1">
            <div className="h-3 w-28 rounded bg-[#383840] animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-[#383840]/60 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Topbar Skeleton */}
        <header className="flex md:hidden items-center justify-between border-b border-zinc-800/80 bg-[#2C2C30] px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#383840] animate-pulse" />
            <div className="h-5 w-20 rounded bg-[#383840] animate-pulse" />
          </div>
          <div className="h-7 w-7 rounded-full bg-[#383840] animate-pulse" />
        </header>

        {/* Main Content Area Skeleton */}
        <main className="flex flex-1 w-full max-w-7xl flex-col p-4 sm:p-8 mx-auto space-y-8">
          {/* Header Banner Skeleton */}
          <div className="bg-[#2C2C30] border border-zinc-800/60 p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 w-52 rounded-lg bg-[#383840] animate-pulse" />
              <div className="h-4 w-72 sm:w-96 rounded-lg bg-[#383840]/60 animate-pulse" />
            </div>
            <div className="h-9 w-32 rounded-lg bg-[#383840] animate-pulse shrink-0" />
          </div>

          {/* Boards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-[#2C2C30] border border-zinc-800/60 p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-24 rounded bg-[#383840]/60 animate-pulse" />
                    <div className="h-4 w-12 rounded bg-[#383840] animate-pulse" />
                  </div>
                  <div className="h-5 w-3/4 rounded-lg bg-[#383840] animate-pulse" />
                </div>
                <div className="flex justify-between items-center border-t border-zinc-800/80 pt-3">
                  <div className="h-3 w-20 rounded bg-[#383840]/50 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-[#383840]/80 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function BoardLoading() {
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
          <div className="h-9 w-full rounded-lg bg-[#383840]/40 animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-[#383840] animate-pulse" />
        </div>

        <div className="border-t border-zinc-800/80 pt-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#383840] animate-pulse" />
          <div className="space-y-1">
            <div className="h-3 w-28 rounded bg-[#383840] animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-[#383840]/60 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Board Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Board Header Skeleton */}
        <div className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#1A1A1E]/90 backdrop-blur-md px-4 sm:px-6 py-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="h-7 w-20 rounded-lg bg-[#383840] animate-pulse" />
              <div className="h-7 w-44 rounded-lg bg-[#383840] animate-pulse" />
              <div className="h-6 w-24 rounded-md bg-[#383840]/60 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-24 rounded-lg bg-[#383840] animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-[#383840] animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-[#383840] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Board Workspace Content Skeleton */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-auto space-y-6">
          {/* Filter Toolbar Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#232328] p-3 sm:p-4 rounded-xl border border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="h-8 w-44 rounded-lg bg-[#18181b] border border-zinc-800 animate-pulse" />
              <div className="h-8 w-32 rounded-lg bg-[#18181b] border border-zinc-800 animate-pulse" />
              <div className="h-8 w-32 rounded-lg bg-[#18181b] border border-zinc-800 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-[#18181b] border border-zinc-800 animate-pulse" />
              <div className="h-8 w-32 rounded-lg bg-[#18181b] border border-zinc-800 animate-pulse" />
            </div>
            <div className="h-4 w-36 rounded bg-[#383840]/60 animate-pulse" />
          </div>

          {/* Kanban Columns & Task Cards Skeleton */}
          <div className="flex gap-4 sm:gap-6 items-start pr-6 sm:pr-10 pb-4">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className="w-72 sm:w-80 flex-shrink-0 rounded-xl bg-[#2C2C30] p-3 space-y-3 border border-zinc-800/40"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-zinc-800/60">
                  <div className="h-5 w-28 rounded bg-[#383840] animate-pulse" />
                  <div className="h-4 w-6 rounded-full bg-[#383840]/60 animate-pulse" />
                </div>

                {/* Task Card Skeletons */}
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-[#1A1A1E] p-3 space-y-2.5 border border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-8 rounded bg-[#383840]/60 animate-pulse" />
                      <div className="h-4 w-3/4 rounded bg-[#383840] animate-pulse" />
                    </div>
                    <div className="h-3 w-1/2 rounded bg-[#383840]/50 animate-pulse" />
                    <div className="border-t border-zinc-800/80 pt-2 flex justify-between items-center">
                      <div className="h-3.5 w-16 rounded bg-[#383840]/60 animate-pulse" />
                      <div className="h-5 w-5 rounded-full bg-[#383840] animate-pulse" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#1A1A1E] p-3 space-y-2.5 border border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-8 rounded bg-[#383840]/60 animate-pulse" />
                      <div className="h-4 w-4/5 rounded bg-[#383840] animate-pulse" />
                    </div>
                    <div className="border-t border-zinc-800/80 pt-2 flex justify-between items-center">
                      <div className="h-3.5 w-20 rounded bg-[#383840]/60 animate-pulse" />
                      <div className="h-5 w-5 rounded-full bg-[#383840] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Add Task Button Skeleton */}
                <div className="h-8 w-full rounded-lg bg-[#383840]/30 animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

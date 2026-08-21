export default function DocsLoading() {
  return (
    <div className="flex min-h-screen bg-[#1A1A1E] text-zinc-100 font-sans">
      {/* Left Sidebar Navigation Skeleton (Desktop) */}
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

      {/* Main Docs Hub Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Skeleton */}
        <header className="border-b border-zinc-800/80 bg-[#2C2C30] px-5 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 rounded bg-[#383840] animate-pulse" />
            <span className="text-zinc-600">/</span>
            <div className="h-5 w-32 rounded bg-[#383840] animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-[#383840]/60 animate-pulse" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-[#383840] animate-pulse" />
        </header>

        {/* Split-Pane Docs Workspace Skeleton */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
            {/* Left Document List Skeleton */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 p-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="h-5 w-28 rounded bg-[#383840] animate-pulse" />
                <div className="h-7 w-16 rounded-lg bg-[#383840] animate-pulse" />
              </div>
              <div className="h-8 w-full rounded-lg bg-[#1a1a1e] border border-zinc-800 animate-pulse" />
              <div className="flex gap-1.5 overflow-hidden">
                <div className="h-5 w-12 rounded-full bg-[#383840] animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-[#383840]/60 animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-[#383840]/60 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1f1f24] border border-zinc-800/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-36 rounded bg-[#383840] animate-pulse" />
                      <div className="h-3.5 w-10 rounded bg-[#383840]/60 animate-pulse" />
                    </div>
                    <div className="h-3 w-24 rounded bg-[#383840]/40 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Document Viewer Skeleton */}
            <div className="flex-1 h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 overflow-hidden flex flex-col">
              <div className="p-4 bg-[#242429] border-b border-zinc-800/80 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-5 w-48 rounded bg-[#383840] animate-pulse" />
                  <div className="h-3 w-32 rounded bg-[#383840]/60 animate-pulse" />
                </div>
                <div className="h-8 w-28 rounded-lg bg-[#383840] animate-pulse" />
              </div>
              <div className="p-6 sm:p-8 flex-1 bg-[#1A1A1E] space-y-4">
                <div className="h-7 w-2/3 rounded bg-[#383840] animate-pulse" />
                <div className="h-4 w-full rounded bg-[#383840]/60 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-[#383840]/50 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-[#383840]/50 animate-pulse" />
                <div className="h-24 w-full rounded-lg bg-[#242429] border border-zinc-800 animate-pulse mt-4" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

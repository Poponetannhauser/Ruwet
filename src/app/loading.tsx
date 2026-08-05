export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="h-6 w-36 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-8 w-24 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </header>

      {/* Main Content Skeleton */}
      <main className="flex flex-1 w-full max-w-6xl flex-col p-4 sm:p-8 mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-72 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Boards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs animate-pulse space-y-3"
            >
              <div className="h-5 w-3/4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

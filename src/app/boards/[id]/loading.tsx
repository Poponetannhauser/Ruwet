export default function BoardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header Back Bar Skeleton */}
      <div className="bg-zinc-100 px-4 sm:px-8 py-2 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
        <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>

      {/* Board Title Header Skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-8 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="h-7 w-44 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-5 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-28 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Kanban Columns Skeleton */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-auto">
        <div className="flex gap-6 items-start">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="w-72 flex-shrink-0 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-zinc-300 dark:bg-zinc-800" />
                <div className="h-5 w-8 rounded-full bg-zinc-300 dark:bg-zinc-800" />
              </div>

              <div className="space-y-3">
                <div className="h-20 rounded-lg bg-white dark:bg-zinc-800/80 p-3" />
                <div className="h-24 rounded-lg bg-white dark:bg-zinc-800/80 p-3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

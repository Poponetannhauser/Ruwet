type Member = {
  id: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

export function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {members.map((m) => {
        const name = m.profiles?.full_name || 'User'
        const initial = name.charAt(0).toUpperCase()

        return (
          <div
            key={m.id}
            title={`${name} (${m.role})`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-xs font-bold text-white dark:border-zinc-900"
          >
            {initial}
          </div>
        )
      })}
    </div>
  )
}

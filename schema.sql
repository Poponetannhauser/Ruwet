-- 1. Users (Supabase Auth udah handle sebagian, ini profile tambahan)
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Boards (workspace tim)
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- 3. Board members (siapa aja yang join board)
create table board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  user_id uuid references profiles(id),
  role text default 'member', -- 'owner' | 'member'
  joined_at timestamptz default now(),
  unique(board_id, user_id)
);

-- 4. Task columns (status kolom, biar fleksibel bukan hardcode)
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  name text not null, -- 'To Do', 'In Progress', 'Review', 'Done'
  position int not null -- urutan kolom
);

-- 5. Tasks (inti dari semuanya)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  column_id uuid references columns(id),
  title text not null,
  description text,
  assignee_id uuid references profiles(id),
  due_date date,
  position int not null, -- urutan dalam kolom (buat drag-drop)
  status_updated_at timestamptz default now(), -- kunci buat stale detection
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Task activity log (buat activity feed & implicit comms)
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  board_id uuid references boards(id) on delete cascade,
  user_id uuid references profiles(id),
  action_type text not null, -- 'created' | 'assigned' | 'status_changed' | 'commented'
  detail jsonb, -- fleksibel: {"from": "To Do", "to": "In Progress"}
  created_at timestamptz default now()
);

-- 7. Comments (biar diskusi nggak lari ke chat app luar)
create table comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);
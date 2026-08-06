-- Clear existing definitions for idempotent execution
drop table if exists comments cascade;
drop table if exists activity_log cascade;
drop table if exists tasks cascade;
drop table if exists columns cascade;
drop table if exists board_members cascade;
drop table if exists boards cascade;
drop table if exists profiles cascade;

-- 1. Users (Profiles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Boards (workspace tim)
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references profiles(id) on delete set null,
  stale_threshold_hours numeric default 48,
  created_at timestamptz default now()
);

-- 3. Board members (siapa aja yang join board)
create table board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member', -- 'owner' | 'member'
  joined_at timestamptz default now(),
  unique(board_id, user_id)
);

-- 4. Task columns
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  name text not null, -- 'To Do', 'In Progress', 'Review', 'Done'
  position int not null
);

-- 5. Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  column_id uuid references columns(id) on delete set null,
  title text not null,
  description text,
  assignee_id uuid references profiles(id) on delete set null,
  due_date date,
  position int not null,
  status_updated_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Task activity log
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  board_id uuid references boards(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action_type text not null,
  detail jsonb,
  created_at timestamptz default now()
);

-- 7. Comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES & FUNCTIONS
-------------------------------------------------------

-- Helper function to check if current authenticated user is member of a board
create or replace function is_board_member(p_board_id uuid, p_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from board_members
    where board_id = p_board_id and user_id = p_user_id
  );
end;
$$ language plpgsql security definer;

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table boards enable row level security;
alter table board_members enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;
alter table activity_log enable row level security;
alter table comments enable row level security;

-- 1. Profiles Policies
create policy "Allow authenticated users to view profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Allow users to update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2. Boards Policies
create policy "Users can view boards they are members of"
  on boards for select
  to authenticated
  using (
    owner_id = auth.uid() or is_board_member(id, auth.uid())
  );

create policy "Authenticated users can create boards"
  on boards for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Board owner or member can update board"
  on boards for update
  to authenticated
  using (
    owner_id = auth.uid() or is_board_member(id, auth.uid())
  );

create policy "Only owner can delete board"
  on boards for delete
  to authenticated
  using (owner_id = auth.uid());

-- 3. Board Members Policies
create policy "Users can view members of boards they belong to"
  on board_members for select
  to authenticated
  using (
    is_board_member(board_id, auth.uid())
  );

create policy "Board owner or member can add board members"
  on board_members for insert
  to authenticated
  with check (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board owner can remove board members"
  on board_members for delete
  to authenticated
  using (
    user_id = auth.uid() or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 4. Columns Policies
create policy "Board members can view columns"
  on columns for select
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can insert columns"
  on columns for insert
  to authenticated
  with check (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can update columns"
  on columns for update
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can delete columns"
  on columns for delete
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 5. Tasks Policies
create policy "Board members can view tasks"
  on tasks for select
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can insert tasks"
  on tasks for insert
  to authenticated
  with check (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can update tasks"
  on tasks for update
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can delete tasks"
  on tasks for delete
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 6. Activity Log Policies
create policy "Board members can view activity logs"
  on activity_log for select
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

create policy "Board members can insert activity logs"
  on activity_log for insert
  to authenticated
  with check (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );


-- 7. Comments Policies
create policy "Board members can view comments"
  on comments for select
  to authenticated
  using (
    exists (
      select 1 from tasks t
      where t.id = comments.task_id
      and (
        is_board_member(t.board_id, auth.uid()) or
        exists (select 1 from boards b where b.id = t.board_id and b.owner_id = auth.uid())
      )
    )
  );

create policy "Board members can insert comments"
  on comments for insert
  to authenticated
  with check (
    exists (
      select 1 from tasks t
      where t.id = comments.task_id
      and (
        is_board_member(t.board_id, auth.uid()) or
        exists (select 1 from boards b where b.id = t.board_id and b.owner_id = auth.uid())
      )
    )
  );


-- 8. Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- 8. Notifications Policies
create policy "Users can view their own notifications"
  on notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications for self or teammates"
  on notifications for insert
  to authenticated
  with check (
    user_id = auth.uid() or
    exists (
      select 1 from board_members bm1
      join board_members bm2 on bm1.board_id = bm2.board_id
      where bm1.user_id = auth.uid() and bm2.user_id = notifications.user_id
    )
  );


-- Automatically create profile trigger on auth.users sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-------------------------------------------------------
-- SUPABASE REALTIME PUBLICATION SETUP
-------------------------------------------------------

-- Enable Realtime publication for tasks, columns, comments, and notifications
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table columns;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table notifications;
alter table tasks replica identity full;
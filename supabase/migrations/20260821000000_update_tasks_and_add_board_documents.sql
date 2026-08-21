-- Migration: Update tasks priority to P0-P3, add category and phase, and add board_documents table

-- 1. Tasks Table Generalization
-- 1a. Map existing priorities to P0-P3
update tasks
set priority = case
  when priority = 'urgent' then 'P0'
  when priority = 'high' then 'P1'
  when priority = 'low' then 'P3'
  else 'P2'
end
where priority in ('low', 'medium', 'high', 'urgent');

-- 1b. Drop old constraint and add new P0-P3 check constraint
alter table tasks
  drop constraint if exists tasks_priority_check;

alter table tasks
  add constraint tasks_priority_check check (priority in ('P0', 'P1', 'P2', 'P3'));

alter table tasks
  alter column priority set default 'P2';

-- 1c. Add category and phase columns
alter table tasks
  add column if not exists category text,
  add column if not exists phase text;

-- 1d. Create index for filtering by category and phase
create index if not exists idx_tasks_board_category_phase
  on tasks (board_id, category, phase);


-- 2. Board Documents Table (File Upload Storage)
create table if not exists board_documents (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  title text not null,
  file_name text,
  file_size bigint,
  file_type text,
  content text default '',
  doc_type text default 'general', -- 'prd' | 'gdd' | 'tech_spec' | 'meeting_notes' | 'general'
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index on board_documents
create index if not exists idx_board_documents_board_id on board_documents(board_id);

-- Enable RLS on board_documents
alter table board_documents enable row level security;

-- Drop existing policies if any
drop policy if exists "Board members can view documents" on board_documents;
drop policy if exists "Board members can insert documents" on board_documents;
drop policy if exists "Board members can update documents" on board_documents;
drop policy if exists "Board members can delete documents" on board_documents;

-- 2a. Select policy
create policy "Board members can view documents"
  on board_documents for select
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 2b. Insert policy
create policy "Board members can insert documents"
  on board_documents for insert
  to authenticated
  with check (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 2c. Update policy
create policy "Board members can update documents"
  on board_documents for update
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

-- 2d. Delete policy
create policy "Board members can delete documents"
  on board_documents for delete
  to authenticated
  using (
    is_board_member(board_id, auth.uid()) or
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  );

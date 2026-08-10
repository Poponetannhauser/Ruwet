-- Migration: Add sequential task_number per board to tasks table

alter table tasks
  add column if not exists task_number integer;

-- Trigger to auto-assign task_number per board_id
create or replace function set_task_number()
returns trigger as $$
begin
  if new.task_number is null then
    select coalesce(max(task_number), 0) + 1
    into new.task_number
    from tasks
    where board_id = new.board_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_set_task_number on tasks;
create trigger tr_set_task_number
  before insert on tasks
  for each row execute function set_task_number();

-- Backfill existing tasks with sequential task_number per board
with numbered_tasks as (
  select id, row_number() over (partition by board_id order by created_at asc) as seq_num
  from tasks
  where task_number is null
)
update tasks
set task_number = numbered_tasks.seq_num
from numbered_tasks
where tasks.id = numbered_tasks.id;

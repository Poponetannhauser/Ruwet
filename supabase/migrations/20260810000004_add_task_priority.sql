-- Migration: Add priority column to tasks table

alter table tasks
  add column if not exists priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent'));

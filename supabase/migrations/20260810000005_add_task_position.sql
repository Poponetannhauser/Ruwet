-- Migration: Add position column to tasks table for ordering

alter table tasks
  add column if not exists position integer default 1;

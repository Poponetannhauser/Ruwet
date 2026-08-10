-- Migration: Add telegram_metrics table for tracking bot command pull vs push notification usage

create table if not exists telegram_metrics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  chat_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table telegram_metrics enable row level security;

-- Allow service role access for Edge Functions
create policy "Allow service role full access to telegram_metrics"
  on telegram_metrics for all
  to service_role
  using (true)
  with check (true);

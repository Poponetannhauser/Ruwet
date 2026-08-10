-- Migration: Add telegram fields and protection trigger to profiles table

alter table profiles
  add column if not exists telegram_chat_id text unique,
  add column if not exists telegram_link_token text,
  add column if not exists telegram_link_expires_at timestamptz;

-- Protect telegram fields from being modified directly by authenticated client
create or replace function protect_profile_telegram_fields()
returns trigger as $$
begin
  if (auth.role() = 'authenticated') then
    if (new.telegram_chat_id is distinct from old.telegram_chat_id) then
      raise exception 'telegram_chat_id cannot be modified directly from client';
    end if;
    if (new.telegram_link_token is distinct from old.telegram_link_token) then
      raise exception 'telegram_link_token cannot be modified directly from client';
    end if;
    if (new.telegram_link_expires_at is distinct from old.telegram_link_expires_at) then
      raise exception 'telegram_link_expires_at cannot be modified directly from client';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_profile_telegram_fields on profiles;
create trigger tr_protect_profile_telegram_fields
  before update on profiles
  for each row execute function protect_profile_telegram_fields();

-- Migration: Add onboarding_dismissed column to profiles table

alter table profiles
  add column if not exists onboarding_dismissed boolean default false;

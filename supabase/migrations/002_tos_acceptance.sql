-- Migration: Add Terms of Service acceptance tracking to users table
-- Run this in Supabase SQL Editor or via CLI

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tos_accepted_version text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tos_accepted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tos_ip_address text DEFAULT NULL;

-- Index for quick lookup (used on every page load)
CREATE INDEX IF NOT EXISTS idx_users_tos_version ON public.users (tos_accepted_version);

COMMENT ON COLUMN public.users.tos_accepted_version IS 'Version string of the last accepted Terms of Service (e.g. "2026-04-19"). NULL means never accepted.';
COMMENT ON COLUMN public.users.tos_accepted_at IS 'Timestamp when user accepted the current version of the Terms of Service.';
COMMENT ON COLUMN public.users.tos_ip_address IS 'IP address at time of ToS acceptance — retained for legal evidentiary purposes.';

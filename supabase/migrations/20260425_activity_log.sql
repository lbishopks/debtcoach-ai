-- ─── Activity Log ─────────────────────────────────────────────────────────────
-- Records key user actions for admin visibility, support, and audit purposes.

CREATE TABLE IF NOT EXISTS public.activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,   -- e.g. 'chat', 'letter_generated', 'forum_post'
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_user_time  ON public.activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_action_time ON public.activity_log (action, created_at DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own log; admin reads via service role (bypasses RLS)
CREATE POLICY "activity_log_read_own" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

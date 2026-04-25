-- ─── Community Forum ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  slug      TEXT NOT NULL UNIQUE,
  description TEXT,
  color     TEXT NOT NULL DEFAULT 'teal',
  icon      TEXT NOT NULL DEFAULT 'message-square',
  sort_order INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 10000),
  reply_count INTEGER NOT NULL DEFAULT 0,
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  is_locked   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 2 AND 5000),
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS forum_posts_category_created ON public.forum_posts (category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_user ON public.forum_posts (user_id);
CREATE INDEX IF NOT EXISTS forum_replies_post ON public.forum_replies (post_id, created_at ASC);

-- RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Categories: anyone authenticated can read (pro enforced in app layer)
CREATE POLICY "forum_categories_read" ON public.forum_categories
  FOR SELECT USING (true);

-- Posts: authenticated users can read; only owner can update
CREATE POLICY "forum_posts_read" ON public.forum_posts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "forum_posts_insert" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts_update" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Replies: same pattern
CREATE POLICY "forum_replies_read" ON public.forum_replies
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "forum_replies_insert" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_replies_update" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to keep reply_count + category post_count in sync
CREATE OR REPLACE FUNCTION public.forum_increment_reply_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.forum_posts SET reply_count = reply_count + 1, updated_at = now()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.forum_increment_post_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.forum_categories SET post_count = post_count + 1
  WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_forum_reply_count
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.forum_increment_reply_count();

CREATE OR REPLACE TRIGGER trg_forum_post_count
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_increment_post_count();

-- ─── Seed default categories ──────────────────────────────────────────────────
INSERT INTO public.forum_categories (name, slug, description, color, icon, sort_order) VALUES
  ('Share Your Win', 'wins',
   'Tell the community about successful disputes, deletions, and settlements. Wins big and small welcome.',
   'teal', 'trophy', 1),
  ('Collector Complaints', 'collectors',
   'Share experiences with specific debt collectors. Who is aggressive? Who responded to letters?',
   'red', 'alert-triangle', 2),
  ('Credit Report Issues', 'credit-reports',
   'Discuss errors, disputes, bureau responses, and credit report experiences.',
   'yellow', 'file-text', 3),
  ('Know Your Rights', 'rights',
   'Share resources, statutes, and public information about FDCPA, FCRA, and consumer protection laws.',
   'blue', 'shield', 4),
  ('State-Specific', 'state-specific',
   'Connect with others in your state. State laws, local resources, and AG contacts.',
   'purple', 'map-pin', 5),
  ('General Discussion', 'general',
   'Everything else — questions, strategies, tips, and general debt-related discussion.',
   'gray', 'message-square', 6)
ON CONFLICT (slug) DO NOTHING;

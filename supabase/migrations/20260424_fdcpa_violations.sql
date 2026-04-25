CREATE TABLE IF NOT EXISTS public.fdcpa_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  debt_id UUID REFERENCES public.debts(id) ON DELETE SET NULL,
  collector_name TEXT NOT NULL,
  contact_date DATE NOT NULL,
  contact_time TEXT,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('phone','text','email','letter','in_person','voicemail','other')),
  phone_number TEXT,
  description TEXT NOT NULL,
  fdcpa_sections TEXT[] DEFAULT '{}',
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.fdcpa_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_violations" ON public.fdcpa_violations
  FOR ALL
  USING (auth.uid() = user_id);

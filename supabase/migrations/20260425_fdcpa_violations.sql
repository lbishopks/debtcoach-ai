-- FDCPA Violation Log
create table if not exists fdcpa_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  collector_name text not null,
  collector_phone text,
  violation_type text not null,
  violation_date date not null,
  description text not null,
  evidence_notes text,
  status text not null default 'documented' check (status in ('documented','reported','legal_action','resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists fdcpa_violations_user_id_idx on fdcpa_violations(user_id);
create index if not exists fdcpa_violations_created_at_idx on fdcpa_violations(created_at desc);

alter table fdcpa_violations enable row level security;

create policy "Users can manage own violations"
  on fdcpa_violations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add sent tracking to letters
alter table letters
  add column if not exists sent_at timestamptz,
  add column if not exists sent_method text check (sent_method in ('certified_mail','regular_mail','email','fax','hand_delivered')),
  add column if not exists usps_tracking text,
  add column if not exists response_deadline date,
  add column if not exists response_received_at timestamptz,
  add column if not exists response_notes text;

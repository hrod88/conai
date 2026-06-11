create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  type text not null default 'percentage',  -- 'percentage' | 'fixed'
  discount numeric not null,
  label text not null,
  min_purchase numeric,
  max_uses integer,
  uses_count integer default 0,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table coupons enable row level security;

-- Solo admins (service role) pueden leer/escribir
create policy "service role full access" on coupons
  using (true)
  with check (true);

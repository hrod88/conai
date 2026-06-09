-- Tabla de reseñas reales
-- Ejecutar en Supabase > SQL Editor

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  product_id  uuid references products(id) on delete cascade not null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique (user_id, product_id)
);

alter table reviews enable row level security;

-- Cualquiera puede leer las reseñas
drop policy if exists "Reviews visibles para todos" on reviews;
create policy "Reviews visibles para todos"
  on reviews for select using (true);

-- Solo usuarios autenticados pueden insertar sus propias reseñas
drop policy if exists "Insert propia review" on reviews;
create policy "Insert propia review"
  on reviews for insert with check (auth.uid() = user_id);

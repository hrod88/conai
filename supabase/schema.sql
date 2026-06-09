-- ============================================================
-- conAI — Schema inicial
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- PRODUCTOS
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10,2) not null,
  category    text not null check (category in ('salud','belleza','hogar','wearables','mascotas','gadgets')),
  icon        text,
  tag         text check (tag in ('bestseller','nuevo','descuento')),
  stock       int default 0,
  rating      numeric(3,2) default 4.5,
  review_count int default 0,
  created_at  timestamptz default now()
);

-- PEDIDOS
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  total             numeric(10,2) not null,
  status            text default 'pending' check (status in ('pending','paid','shipped','delivered')),
  transbank_token   text,
  shipping_name     text,
  shipping_phone    text,
  shipping_address  text,
  shipping_city     text,
  shipping_region   text,
  shipping_cost     numeric(10,2) default 0,
  created_at        timestamptz default now()
);

-- ITEMS DE PEDIDO
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  product_id  uuid references products(id),
  quantity    int not null,
  unit_price  numeric(10,2) not null
);

-- FAVORITOS
create table if not exists favorites (
  user_id    uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table products   enable row level security;
alter table orders     enable row level security;
alter table order_items enable row level security;
alter table favorites  enable row level security;

-- Productos: lectura pública
drop policy if exists "Productos visibles para todos" on products;
create policy "Productos visibles para todos"
  on products for select using (true);

-- Pedidos: solo el dueño
drop policy if exists "Pedidos solo del usuario" on orders;
create policy "Pedidos solo del usuario"
  on orders for all using (auth.uid() = user_id);

-- Items: solo si el pedido es del usuario
drop policy if exists "Items solo del usuario" on order_items;
create policy "Items solo del usuario"
  on order_items for all using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Favoritos: solo el dueño
drop policy if exists "Favoritos solo del usuario" on favorites;
create policy "Favoritos solo del usuario"
  on favorites for all using (auth.uid() = user_id);

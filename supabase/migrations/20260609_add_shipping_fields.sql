-- Agregar campos de envío a orders
-- Ejecutar en Supabase > SQL Editor

alter table orders
  add column if not exists shipping_name    text,
  add column if not exists shipping_phone   text,
  add column if not exists shipping_city    text,
  add column if not exists shipping_region  text,
  add column if not exists shipping_cost    numeric(10,2) default 0;

create or replace function decrement_stock(
  p_product_id uuid,
  p_quantity   int
)
returns boolean
language plpgsql
as $$
declare
  v_ok boolean;
begin
  update products
     set stock = stock - p_quantity
   where id = p_product_id
     and stock >= p_quantity
  returning true into v_ok;

  return coalesce(v_ok, false);
end;
$$;
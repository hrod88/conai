alter table orders
  add column if not exists stock_issue boolean default false;
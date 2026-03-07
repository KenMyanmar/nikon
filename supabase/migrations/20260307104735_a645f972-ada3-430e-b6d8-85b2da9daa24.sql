-- Migration 2: Commerce Tables + Auto-Increment Numbers

-- 1. customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  company_name text,
  company_type text,
  customer_type text not null default 'retail',
  credit_limit numeric(15,2) not null default 0,
  payment_terms text not null default 'prepaid',
  is_approved_buyer boolean not null default false,
  account_manager text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. customer_addresses
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  address_line text not null,
  township text,
  city text,
  region text,
  is_default boolean not null default false,
  contact_phone text,
  delivery_notes text,
  created_at timestamptz not null default now()
);

-- 3. cart_items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, product_id)
);

-- 4. orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default '',
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending',
  subtotal numeric(15,2),
  shipping_cost numeric(15,2) not null default 0,
  tax numeric(15,2) not null default 0,
  discount numeric(15,2) not null default 0,
  total numeric(15,2),
  currency text not null default 'MMK',
  payment_method text,
  payment_status text not null default 'pending',
  payment_reference text,
  purchase_order_number text,
  delivery_address_id uuid references public.customer_addresses(id) on delete set null,
  delivery_method text,
  tracking_number text,
  estimated_delivery date,
  customer_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. order_items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  product_name text,
  quantity integer not null,
  unit_price numeric(15,2) not null,
  total numeric(15,2) not null,
  created_at timestamptz not null default now()
);

-- 6. quotes
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null default '',
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending',
  items jsonb not null,
  response_items jsonb,
  total_quoted numeric(15,2),
  valid_until date,
  project_type text,
  timeline text,
  budget_range text,
  additional_notes text,
  attachments jsonb not null default '[]'::jsonb,
  sales_rep_id uuid,
  converted_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. saved_lists
create table public.saved_lists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- 8. saved_list_items
create table public.saved_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.saved_lists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  unique(list_id, product_id)
);

-- 9. banners
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  position text,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 10. Auto-increment sequences and functions for order_number
create sequence public.order_number_seq start with 1 increment by 1;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'IKON-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_generate_order_number
  before insert on public.orders
  for each row
  execute function public.generate_order_number();

-- 11. Auto-increment for quote_number
create sequence public.quote_number_seq start with 1 increment by 1;

create or replace function public.generate_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := 'QT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_generate_quote_number
  before insert on public.quotes
  for each row
  execute function public.generate_quote_number();

-- 12. Performance indexes
create index idx_customers_user_id on public.customers(user_id);
create index idx_customer_addresses_customer_id on public.customer_addresses(customer_id);
create index idx_cart_items_customer_id on public.cart_items(customer_id);
create index idx_orders_customer_id on public.orders(customer_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_quotes_customer_id on public.quotes(customer_id);
create index idx_quotes_status on public.quotes(status);
create index idx_saved_lists_customer_id on public.saved_lists(customer_id);
create index idx_banners_is_active on public.banners(is_active);
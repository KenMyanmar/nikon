-- Migration 1: Catalog Tables + Full-Text Search

-- 1. Enable pg_trgm for fuzzy search
create extension if not exists pg_trgm with schema public;

-- 2. product_groups
create table public.product_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- 3. categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  group_id uuid references public.product_groups(id) on delete set null,
  description text,
  image_url text,
  sort_order int not null default 0,
  product_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  country text,
  website text,
  is_featured boolean not null default false,
  product_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  stock_code text not null unique,
  other_code text,
  description text not null,
  short_description text,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  group_id uuid references public.product_groups(id) on delete set null,
  unit_cost numeric(15,2) not null default 0,
  selling_price numeric(15,2),
  currency text not null default 'MMK',
  unit_of_measure text,
  packing text,
  moq int not null default 1,
  onhand_qty int not null default 0,
  min_qty int not null default 0,
  max_qty int not null default 0,
  reorder_qty int not null default 0,
  stock_status text not null default 'in_stock',
  images jsonb not null default '[]'::jsonb,
  thumbnail_url text,
  datasheet_url text,
  specifications jsonb not null default '{}'::jsonb,
  item_type text,
  main_vendor text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. pricing_tiers
create table public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_qty int not null,
  max_qty int,
  unit_price numeric(15,2) not null,
  customer_segment text not null default 'all',
  created_at timestamptz not null default now()
);

-- 7. Search trigger function
create or replace function public.update_product_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.description, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.stock_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.other_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.short_description, '')), 'B');
  return new;
end;
$$;

create trigger trg_update_product_search_vector
  before insert or update on public.products
  for each row
  execute function public.update_product_search_vector();

-- 8. Indexes
create index idx_products_search_vector on public.products using gin(search_vector);
create index idx_products_description_trgm on public.products using gin(description public.gin_trgm_ops);
create index idx_products_stock_code on public.products(stock_code);
create index idx_products_other_code on public.products(other_code);
create index idx_products_brand_id on public.products(brand_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_group_id on public.products(group_id);
create index idx_products_selling_price on public.products(selling_price);
create index idx_products_is_active on public.products(is_active);
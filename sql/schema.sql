-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Customers Table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  company text,
  email text,
  phone text,
  notes text,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create VPS Table
create table public.vps (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  provider text,
  ip_address text,
  os text,
  cpu text,
  ram text,
  disk text,
  expiry_date date,
  status text default 'Online',
  customer_id uuid references public.customers(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Hosting Packages Table
create table public.hosting_packages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text, -- Shared, Reseller, Dedicated
  vps_id uuid references public.vps(id),
  control_panel text,
  customer_id uuid references public.customers(id),
  primary_domain text,
  ip_address text,
  expiry_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Domains Table
create table public.domains (
  id uuid default uuid_generate_v4() primary key,
  domain_name text not null,
  registrar text,
  purchase_date date,
  expiry_date date,
  nameservers text[], -- Array of strings
  hosting_id uuid references public.hosting_packages(id),
  customer_id uuid references public.customers(id),
  status text default 'Active',
  is_auto_renew boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Optional for now but recommended
alter table public.customers enable row level security;
alter table public.vps enable row level security;
alter table public.hosting_packages enable row level security;
alter table public.domains enable row level security;

-- Create Policy to allow public read/write (FOR LEARNING/DEV ONLY - CHANGE FOR PROD)
create policy "Public Access Customers" on public.customers for all using (true);
create policy "Public Access VPS" on public.vps for all using (true);
create policy "Public Access Hosting" on public.hosting_packages for all using (true);
create policy "Public Access Domains" on public.domains for all using (true);

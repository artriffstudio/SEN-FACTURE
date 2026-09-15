-- ============================================================
-- FACTURIM — Schéma de Base de Données Supabase (PostgreSQL)
-- Conforme Réglementation Fiscale & DGI République Islamique de Mauritanie
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABLE : companies (Entreprises / Utilisateurs émetteurs)
-- ============================================================
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  address text,
  city text default 'Nouakchott',
  country text default 'Mauritanie',
  tax_id text, -- NIF (Numéro d'Identification Fiscale)
  rccm text,   -- Registre de Commerce (RC)
  currency text default 'MRU',
  tax_rate numeric(5, 2) default 16.00, -- TVA 16% légale Mauritanie
  logo_url text,
  invoice_prefix text default 'FAC-2025-',
  next_invoice_number integer default 1,
  bank_rib text default 'MR13 00010 01234567890 12 (BPM Mauritanie)',
  wave_phone text default '+222 45 00 00 00', -- Numéro Bankily / Paiement mobile
  om_phone text default '+222 36 00 00 00',   -- Numéro Seddap / Masrvi
  terms_and_conditions text default 'Paiement à réception par virement bancaire BPM ou paiement mobile (Bankily / Seddap / Masrvi). Conformément aux règles de facturation en vigueur en République Islamique de Mauritanie.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 3. TABLE : clients (Clients & Entreprises partenaires)
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  address text,
  city text default 'Nouakchott',
  country text default 'Mauritanie',
  tax_id text, -- NIF Client
  notes text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour recherches rapides
create index if not exists idx_clients_company on public.clients(company_id);
create index if not exists idx_clients_email on public.clients(email);

-- ============================================================
-- 4. TABLE : catalog_items (Catalogue de prestations & forfaits)
-- ============================================================
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  category text not null check (category in ('Developpement', 'Cloud & Reseau', 'Conseil & Audit', 'Maintenance', 'Formation')),
  unit_price numeric(15, 2) not null default 0,
  unit text not null default 'Forfait',
  tax_rate numeric(5, 2) not null default 16.00,
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_catalog_company on public.catalog_items(company_id);

-- ============================================================
-- 5. TABLE : invoices (Factures & Devis officiels)
-- ============================================================
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete restrict,
  invoice_number text not null unique,
  status text not null check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')) default 'draft',
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '30 days'),
  subtotal numeric(15, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 16.00,
  tax_amount numeric(15, 2) not null default 0,
  total numeric(15, 2) not null default 0,
  notes text,
  paid_at timestamp with time zone,
  payment_method text, -- Bankily, Seddap, Masrvi, BPM, Espèces
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_invoices_company on public.invoices(company_id);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_number on public.invoices(invoice_number);

-- ============================================================
-- 6. TABLE : invoice_items (Lignes de prestations d'une facture)
-- ============================================================
create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(15, 2) not null default 0,
  total numeric(15, 2) not null default 0,
  sort_order integer not null default 0
);

create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- ============================================================
-- 7. TABLE : support_tickets (Tickets de support & assistance)
-- ============================================================
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  subject text not null,
  category text not null,
  priority text not null default 'Normale',
  message text not null,
  status text not null default 'Ouvert',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 8. SÉCURITÉ & ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.companies enable row level security;
alter table public.clients enable row level security;
alter table public.catalog_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.support_tickets enable row level security;

-- Politiques de sécurité pour companies
create policy "Users can view their own companies"
  on public.companies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own companies"
  on public.companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own companies"
  on public.companies for update
  using (auth.uid() = user_id);

-- Politiques de sécurité pour clients
create policy "Users can manage clients of their company"
  on public.clients for all
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- Politiques de sécurité pour catalog_items
create policy "Allow public read for active catalog items"
  on public.catalog_items for select
  using (active = true);

create policy "Users can manage catalog of their company"
  on public.catalog_items for all
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- Politiques de sécurité pour invoices
create policy "Users can manage invoices of their company"
  on public.invoices for all
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- Politiques de sécurité pour invoice_items
create policy "Users can manage invoice items of their company"
  on public.invoice_items for all
  using (invoice_id in (
    select id from public.invoices where company_id in (
      select id from public.companies where user_id = auth.uid()
    )
  ));

-- ============================================================
-- 9. DONNÉES DE DÉPART (Catalogue de prestations standard en MRU)
-- ============================================================
insert into public.catalog_items (code, name, description, category, unit_price, unit, tax_rate, active)
values
  ('DEV-WEB', 'Développement Plateforme Web & API', 'Conception et développement complet d''une application web avec Next.js, API sécurisée et responsive design.', 'Developpement', 95000, 'Forfait', 16.00, true),
  ('DEV-MOB', 'Développement Application Mobile (iOS & Android)', 'Application mobile connectée aux passerelles de paiement Bankily et Seddap.', 'Developpement', 140000, 'Forfait', 16.00, true),
  ('CLOUD-VPS', 'Hébergement Cloud Dédié & Maintenance VPS', 'Serveur dédié haute disponibilité, sauvegardes automatiques quotidiennes, certificat SSL et monitoring 24/7.', 'Cloud & Reseau', 12000, 'Mois', 16.00, true),
  ('AUDIT-SEC', 'Audit de Sécurité & Conformité DGI', 'Analyse des vulnérabilités, vérification des sauvegardes et certification de conformité fiscale et comptable.', 'Conseil & Audit', 48000, 'Forfait', 16.00, true),
  ('MAINT-ANN', 'Contrat de Maintenance & Support Technique', 'Support utilisateur prioritaire, correctifs de bugs, mises à jour logicielles régulières et astreinte téléphonique.', 'Maintenance', 22000, 'Mois', 16.00, true),
  ('FORM-SYS', 'Formation des Équipes & Ateliers Pratiques', 'Session de formation pour collaborateurs sur l''utilisation des logiciels de facturation et de gestion.', 'Formation', 25000, 'Jour', 16.00, true)
on conflict do nothing;

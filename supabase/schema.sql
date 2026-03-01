-- ============================================================
--  SponsorMyThing.com — Database Schema
--  Run this in the Supabase SQL Editor
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  org_name text not null default '',
  org_type text not null default 'nonprofit',
  contact_email text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, contact_email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Campaigns ───────────────────────────────────────────────
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text not null default '',
  campaign_type text not null default 'sponsorship',
  goal_amount numeric(10,2),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Users can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can create campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- ── Prospects ───────────────────────────────────────────────
create table if not exists public.prospects (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  place_id text,
  name text not null,
  address text,
  phone text,
  website text,
  category text,
  rating numeric(2,1),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prospects enable row level security;

create policy "Users can view own prospects"
  on public.prospects for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = prospects.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can create prospects"
  on public.prospects for insert
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = prospects.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can delete own prospects"
  on public.prospects for delete
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = prospects.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ── Enrichments ─────────────────────────────────────────────
create table if not exists public.enrichments (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid references public.prospects(id) on delete cascade not null unique,
  scraped_text text,
  summary text,
  created_at timestamptz not null default now()
);

alter table public.enrichments enable row level security;

create policy "Users can view own enrichments"
  on public.enrichments for select
  using (
    exists (
      select 1 from public.prospects
      join public.campaigns on campaigns.id = prospects.campaign_id
      where prospects.id = enrichments.prospect_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can create enrichments"
  on public.enrichments for insert
  with check (
    exists (
      select 1 from public.prospects
      join public.campaigns on campaigns.id = prospects.campaign_id
      where prospects.id = enrichments.prospect_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ── Outreach Emails ─────────────────────────────────────────
create table if not exists public.outreach_emails (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid references public.prospects(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  subject text not null default '',
  body text not null default '',
  status text not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.outreach_emails enable row level security;

create policy "Users can view own emails"
  on public.outreach_emails for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach_emails.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can create emails"
  on public.outreach_emails for insert
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach_emails.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can update own emails"
  on public.outreach_emails for update
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach_emails.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can delete own emails"
  on public.outreach_emails for delete
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach_emails.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

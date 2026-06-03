-- Create churches table
create table public.churches (
  id text primary key,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create teachers table
create table public.teachers (
  id text primary key,
  name text not null,
  class_id text not null,
  church_id text references public.churches(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create class_configs table
create table public.class_configs (
  class_id text not null,
  day_of_week integer not null,
  church_id text references public.churches(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (class_id, church_id)
);

-- Create monthly_schedules table
create table public.monthly_schedules (
  id text primary key,
  month integer not null,
  year integer not null,
  church_id text references public.churches(id) not null,
  classes jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (month, year, church_id)
);

-- RLS Policies
-- Enable RLS
alter table public.churches enable row level security;
alter table public.teachers enable row level security;
alter table public.class_configs enable row level security;
alter table public.monthly_schedules enable row level security;

-- Policies for churches
create policy "Authenticated users can read all churches" 
on public.churches for select 
to authenticated using (true);

create policy "Admins can insert/update/delete churches" 
on public.churches for all
to authenticated 
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'ADMIN'
  )
);

-- Policies for teachers
create policy "Users can read teachers for their churches" 
on public.teachers for select 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = teachers.church_id or
      teachers.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

create policy "Users can insert/update/delete teachers for their churches" 
on public.teachers for all 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = teachers.church_id or
      teachers.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

-- Policies for class_configs
create policy "Users can read configs for their churches" 
on public.class_configs for select 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = class_configs.church_id or
      class_configs.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

create policy "Users can manage configs for their churches" 
on public.class_configs for all 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = class_configs.church_id or
      class_configs.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

-- Policies for monthly_schedules
create policy "Users can read schedules for their churches" 
on public.monthly_schedules for select 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = monthly_schedules.church_id or
      monthly_schedules.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

create policy "Users can manage schedules for their churches" 
on public.monthly_schedules for all 
to authenticated using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and (
      profiles.role = 'ADMIN' or
      profiles.church_id = monthly_schedules.church_id or
      monthly_schedules.church_id = ANY(profiles.managed_church_ids)
    )
  )
);

-- Public access policies (for public view URLs)
create policy "Public can read churches" on public.churches for select to anon using (true);
create policy "Public can read teachers" on public.teachers for select to anon using (true);
create policy "Public can read class_configs" on public.class_configs for select to anon using (true);
create policy "Public can read monthly_schedules" on public.monthly_schedules for select to anon using (true);

-- ZOART A PROJECT: COMPLETE DATABASE SETUP
-- Run this entire file once in Supabase > SQL Editor > New query.
-- Use this file instead of running the historical migrations individually.
-- Safe to rerun on the supported UUID schema. Existing data is preserved.
-- Does not drop tables or erase existing rows. URL and API keys stay unchanged.
-- Public: project cards, selected majors, approved labels.
-- Backend only: creating projects, availability, major writes, and account likes.
-- NOT VALID checks leave legacy rows unchanged and enforce rules on new writes.

begin;

-- Base tables: also works on a fresh Supabase project's public schema.
create table if not exists public.uci_majors (
  id text primary key,
  name text not null,
  degree text not null
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text not null,
  contact_info text not null,
  application_url text,
  tags text[] not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  major_id text references public.uci_majors(id)
);

-- Keep existing rows; add any columns missing from an older version.
alter table public.projects
  add column if not exists title text,
  add column if not exists author text,
  add column if not exists description text,
  add column if not exists contact_info text,
  add column if not exists application_url text,
  add column if not exists tags text[],
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz default now(),
  add column if not exists major_id text;

do $$ begin
  if (select atttypid <> 'uuid'::regtype from pg_attribute
      where attrelid = 'public.projects'::regclass and attname = 'id' and not attisdropped) then
    raise exception 'projects.id must be UUID. No data has been deleted. Stop and review this older schema before continuing.';
  end if;
  if not exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.projects'::regclass and c.contype = 'f'
      and c.confrelid = 'public.uci_majors'::regclass
      and c.conkey = array[(select attnum from pg_attribute where attrelid = 'public.projects'::regclass and attname = 'major_id')]::smallint[]
  ) then
    alter table public.projects add constraint projects_major_id_fkey
      foreign key (major_id) references public.uci_majors(id) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_required_fields') then
    alter table public.projects add constraint projects_required_fields check (
      title is not null and char_length(btrim(title)) between 1 and 160
      and author is not null and char_length(btrim(author)) between 1 and 100
      and description is not null and char_length(btrim(description)) between 1 and 10000
      and contact_info is not null and char_length(btrim(contact_info)) between 1 and 300
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_application_url') then
    alter table public.projects add constraint projects_application_url check (
      application_url is null or (
        char_length(application_url) between 1 and 2048
        and application_url ~* '^https?://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$'
        and application_url !~ '[[:space:][:cntrl:]]'
        and position(chr(92) in application_url) = 0
      )
    );
  end if;
end $$;

alter table public.projects alter column id set default gen_random_uuid();
alter table public.projects alter column status set default 'active';
alter table public.projects alter column created_at set default now();
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists projects_tags_idx on public.projects using gin(tags);
create index if not exists projects_major_id_idx on public.projects(major_id);

-- Project cards and their majors are public; all writes go through FastAPI.
grant usage on schema public to anon, authenticated, service_role;
alter table public.projects enable row level security;
alter table public.uci_majors enable row level security;
drop policy if exists "Zoart public projects" on public.projects;
create policy "Zoart public projects" on public.projects for select to anon, authenticated using (true);
drop policy if exists "Zoart public majors" on public.uci_majors;
create policy "Zoart public majors" on public.uci_majors for select to anon, authenticated using (true);
revoke all on public.projects, public.uci_majors from public, anon, authenticated;
grant select on public.projects, public.uci_majors to anon, authenticated;
grant select, insert, update, delete on public.projects, public.uci_majors to service_role;


create table if not exists public.project_tag_catalog (label text primary key);
alter table public.project_tag_catalog enable row level security;
drop policy if exists "Public tag catalog" on public.project_tag_catalog;
create policy "Public tag catalog" on public.project_tag_catalog for select to anon, authenticated using (true);
grant select on public.project_tag_catalog to anon, authenticated;
grant all on public.project_tag_catalog to service_role;
revoke insert, update, delete on public.project_tag_catalog from anon, authenticated;

insert into public.project_tag_catalog(label) values
  ('Computer Science'),
  ('Web Dev'),
  ('AI / ML'),
  ('Data Science'),
  ('Games'),
  ('Design'),
  ('Mobile'),
  ('React'),
  ('Hardware'),
  ('Robotics'),
  ('Cybersecurity'),
  ('Research'),
  ('Business'),
  ('Education'),
  ('Health'),
  ('Environment'),
  ('Art'),
  ('Music'),
  ('Community'),
  ('Python'),
  ('JavaScript'),
  ('TypeScript'),
  ('Java'),
  ('C++'),
  ('Rust'),
  ('Go'),
  ('Next.js'),
  ('Vue'),
  ('Databases'),
  ('Cloud Computing'),
  ('DevOps'),
  ('Software Engineering'),
  ('Open Source'),
  ('AR / VR'),
  ('Human-Computer Interaction'),
  ('GIS / Mapping'),
  ('Accessibility'),
  ('Finance'),
  ('Marketing'),
  ('Product Management'),
  ('Writing'),
  ('Film'),
  ('Photography'),
  ('Animation'),
  ('Psychology'),
  ('Biology'),
  ('Chemistry'),
  ('Physics'),
  ('Mathematics'),
  ('Engineering'),
  ('Mechanical Engineering'),
  ('Electrical Engineering'),
  ('Biomedical Engineering'),
  ('Economics'),
  ('Sociology'),
  ('Political Science'),
  ('History'),
  ('Languages'),
  ('Law'),
  ('Public Health'),
  ('Astronomy'),
  ('Humanities'),
  ('Social Sciences')
on conflict do nothing;

-- Same signature as the previous validator, now backed by an expandable catalog.
create or replace function public.valid_project_tags(value text[])
returns boolean language sql stable parallel safe set search_path = '' as $$
  select value is not null and cardinality(value) between 1 and 7
    and array_ndims(value) = 1 and array_position(value, null) is null
    and not exists (select 1 from unnest(value) tag where not exists (
      select 1 from public.project_tag_catalog catalog where catalog.label = tag
    ))
    and cardinality(value) = (select count(distinct tag) from unnest(value) tag);
$$;

-- Preserve the original constraint name; legacy rows need not be rewritten.
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_approved_tags') then
    alter table public.projects add constraint projects_approved_tags check (public.valid_project_tags(tags)) not valid;
  end if;
end $$;

create table if not exists public.project_majors (
  project_id uuid not null references public.projects(id) on delete cascade,
  major_id text not null references public.uci_majors(id),
  primary key (project_id, major_id)
);
insert into public.project_majors(project_id, major_id)
select project.id, project.major_id from public.projects project
join public.uci_majors major on major.id = project.major_id
on conflict do nothing;
alter table public.project_majors enable row level security;
drop policy if exists "Public project majors" on public.project_majors;
create policy "Public project majors" on public.project_majors for select to anon, authenticated using (true);
grant select on public.project_majors to anon, authenticated;
grant all on public.project_majors to service_role;
revoke insert, update, delete on public.project_majors from anon, authenticated;

-- Atomic creation prevents a saved project from losing its major selections.
create or replace function public.create_project_with_majors(p_project jsonb, p_major_ids text[])
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
  if cardinality(p_major_ids) > 100 or array_position(p_major_ids, null) is not null then
    raise exception 'Invalid major selection';
  end if;
  insert into public.projects(title, author, description, contact_info, tags, major_id)
  values (p_project->>'title', p_project->>'author', p_project->>'description', p_project->>'contact_info',
    array(select jsonb_array_elements_text(p_project->'tags')), p_major_ids[1]) returning id into new_id;
  insert into public.project_majors(project_id, major_id)
  select new_id, major_id from (select distinct unnest(p_major_ids) major_id) choices;
  return new_id;
end $$;

create table if not exists public.project_likes (
  project_id uuid not null references public.projects(id) on delete cascade,
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  primary key (project_id, visitor_hash)
);
alter table public.project_likes enable row level security;
-- Visitor identifiers are private. Only the backend can access these rows.
revoke all on public.project_likes from public, anon, authenticated;
grant all on public.project_likes to service_role;

create or replace function public.get_project_likes(p_project_ids uuid[], p_visitor_hash text)
returns table(project_id uuid, like_count bigint, liked boolean)
language sql stable security invoker set search_path = '' as $$
  select project.id, count(likes.project_id), coalesce(bool_or(likes.visitor_hash = p_visitor_hash), false)
  from public.projects project left join public.project_likes likes on likes.project_id = project.id
  where project.id = any(p_project_ids)
  group by project.id;
$$;

create or replace function public.set_project_like(p_project_id uuid, p_visitor_hash text, p_liked boolean)
returns table(like_count bigint, liked boolean)
language plpgsql security invoker set search_path = '' as $$
begin
  -- Lock only this project's row so changes and returned totals are atomic.
  perform id from public.projects where id = p_project_id for update;
  if not found then return; end if;
  if p_liked then
    insert into public.project_likes(project_id, visitor_hash) values (p_project_id, p_visitor_hash) on conflict do nothing;
  else
    delete from public.project_likes where project_id = p_project_id and visitor_hash = p_visitor_hash;
  end if;
  return query select count(*), exists(select 1 from public.project_likes where project_id = p_project_id and visitor_hash = p_visitor_hash)
    from public.project_likes where project_id = p_project_id;
end $$;

revoke execute on function public.create_project_with_majors(jsonb, text[]) from public, anon, authenticated;
revoke execute on function public.get_project_likes(uuid[], text) from public, anon, authenticated;
revoke execute on function public.set_project_like(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.create_project_with_majors(jsonb, text[]) to service_role;
grant execute on function public.get_project_likes(uuid[], text) to service_role;
grant execute on function public.set_project_like(uuid, text, boolean) to service_role;
-- Public SELECT policies are installed above; browser writes remain disabled.
revoke insert, update, delete on public.projects from anon, authenticated;
grant select, insert, update on public.projects to service_role;
grant select, insert, update on public.uci_majors to service_role;
create index if not exists project_majors_major_id_idx on public.project_majors(major_id);
-- ACCOUNT FEATURES START
-- Supabase already manages auth.users. Existing unsigned projects stay unassigned.
alter table public.projects add column if not exists owner_id uuid
  references auth.users(id) on delete set null;
create index if not exists projects_owner_id_idx on public.projects(owner_id);

do $$ begin
  if not exists(select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_availability') then
    alter table public.projects add constraint projects_availability check(status in ('active','offline')) not valid;
  end if;
end $$;

-- New account likes are unique per account. Old browser likes remain preserved.
create table if not exists public.project_user_likes (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(project_id, user_id)
);
alter table public.project_user_likes enable row level security;
revoke all on public.project_user_likes from public, anon, authenticated;
grant all on public.project_user_likes to service_role;

create or replace function public.create_owned_project(p_project jsonb, p_major_ids text[], p_owner_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
  if p_owner_id is null then raise exception 'Sign in required'; end if;
  if char_length(p_project->>'title') > 80 or char_length(p_project->>'description') > 2000 then
    raise exception 'Project title or description is too long';
  end if;
  if cardinality(p_major_ids) > 100 or array_position(p_major_ids, null) is not null then
    raise exception 'Invalid major selection';
  end if;
  insert into public.projects(title,author,description,contact_info,application_url,tags,major_id,owner_id,status)
  values(p_project->>'title',p_project->>'author',p_project->>'description',p_project->>'contact_info',
    nullif(btrim(p_project->>'application_url'),''),
    array(select jsonb_array_elements_text(p_project->'tags')),p_major_ids[1],p_owner_id,'active')
  returning id into new_id;
  insert into public.project_majors(project_id,major_id)
    select new_id,major_id from (select distinct unnest(p_major_ids) major_id) selected;
  return new_id;
end $$;

create or replace function public.set_owned_project_status(p_project_id uuid,p_user_id uuid,p_status text)
returns table(id uuid,status text) language plpgsql security invoker set search_path = '' as $$
begin
  if p_user_id is null or p_status not in ('active','offline') or p_status is null then
    raise exception 'Invalid availability change';
  end if;
  return query update public.projects project set status=p_status
    where project.id=p_project_id and project.owner_id=p_user_id
    returning project.id,project.status;
end $$;

create or replace function public.claim_browser_likes(p_user_id uuid,p_visitor_hash text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_user_id is null or p_visitor_hash !~ '^[a-f0-9]{64}$' or p_visitor_hash is null then
    raise exception 'Invalid like import';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_visitor_hash)::bigint);
  insert into public.project_user_likes(project_id,user_id)
    select project_id,p_user_id from public.project_likes where visitor_hash=p_visitor_hash
    on conflict do nothing;
  delete from public.project_likes where visitor_hash=p_visitor_hash;
end $$;

create or replace function public.get_account_project_likes(p_project_ids uuid[],p_user_id uuid)
returns table(project_id uuid,like_count bigint,liked boolean)
language sql stable security invoker set search_path = '' as $$
  select project.id,
    (select count(*) from public.project_likes legacy where legacy.project_id=project.id)
      + (select count(*) from public.project_user_likes likes where likes.project_id=project.id),
    exists(select 1 from public.project_user_likes likes where likes.project_id=project.id and likes.user_id=p_user_id)
  from public.projects project where project.id=any(p_project_ids);
$$;

create or replace function public.set_account_project_like(p_project_id uuid,p_user_id uuid,p_liked boolean)
returns table(like_count bigint,liked boolean)
language plpgsql security invoker set search_path = '' as $$
begin
  if p_user_id is null or p_liked is null then raise exception 'Sign in required'; end if;
  perform id from public.projects where id=p_project_id for update;
  if not found then return; end if;
  if p_liked then
    insert into public.project_user_likes(project_id,user_id) values(p_project_id,p_user_id) on conflict do nothing;
  else
    delete from public.project_user_likes where project_id=p_project_id and user_id=p_user_id;
  end if;
  return query select totals.like_count,totals.liked
    from public.get_account_project_likes(array[p_project_id],p_user_id) totals;
end $$;

revoke execute on function public.create_owned_project(jsonb,text[],uuid) from public,anon,authenticated;
revoke execute on function public.set_owned_project_status(uuid,uuid,text) from public,anon,authenticated;
revoke execute on function public.claim_browser_likes(uuid,text) from public,anon,authenticated;
revoke execute on function public.get_account_project_likes(uuid[],uuid) from public,anon,authenticated;
revoke execute on function public.set_account_project_like(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.create_owned_project(jsonb,text[],uuid) to service_role;
grant execute on function public.set_owned_project_status(uuid,uuid,text) to service_role;
grant execute on function public.claim_browser_likes(uuid,text) to service_role;
grant execute on function public.get_account_project_likes(uuid[],uuid) to service_role;
grant execute on function public.set_account_project_like(uuid,uuid,boolean) to service_role;

-- Freeze the old anonymous write entry points; all new writes use verified users.
revoke execute on function public.create_project_with_majors(jsonb,text[]) from public,anon,authenticated,service_role;
revoke execute on function public.set_project_like(uuid,text,boolean) from public,anon,authenticated,service_role;
-- ACCOUNT FEATURES END

-- SAFETY AND ACTIVE LIMITS
create or replace function public.zoart_approved_application_url(p_url text)
returns boolean language sql immutable security invoker set search_path = '' as $$
  select p_url is null or (
    char_length(p_url) between 1 and 2048
    and p_url !~ '[[:space:][:cntrl:]]'
    and position(chr(92) in p_url) = 0
    and p_url ~* '^https://(([a-z0-9-]+\.)*uci\.edu([/?#]|$)|forms\.gle([/?#]|$)|docs\.google\.com/forms/|github\.com([/?#]|$))'
  );
$$;

create or replace function public.zoart_enforce_project_rules()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  -- Do not stop an older post from being taken offline just because its old link
  -- is outside today's policy. New links and changed links must satisfy it.
  if TG_OP = 'INSERT' or new.application_url is distinct from old.application_url then
    if not public.zoart_approved_application_url(new.application_url) then
      raise exception using errcode = 'PZ005', message = 'Application link host is not approved';
    end if;
  end if;
  if new.owner_id is not null and new.status = 'active'
     and (TG_OP = 'INSERT' or old.status is distinct from 'active' or old.owner_id is distinct from new.owner_id) then
    -- Creating and reactivating projects use the same account lock, so two tabs
    -- cannot both take the fourth slot. The lock lasts until transaction end.
    perform pg_advisory_xact_lock(hashtext('zoart-active:' || new.owner_id::text)::bigint);
    if (select count(*) from public.projects project
        where project.owner_id = new.owner_id and project.status = 'active'
          and project.id is distinct from new.id) >= 4 then
      raise exception using errcode = 'PZ004', message = 'Maximum of 4 active projects per account';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists zoart_project_rules on public.projects;
create trigger zoart_project_rules before insert or update of application_url, status, owner_id
  on public.projects for each row execute function public.zoart_enforce_project_rules();
create index if not exists projects_active_owner_idx on public.projects(owner_id) where status = 'active';

revoke execute on function public.zoart_approved_application_url(text) from public, anon, authenticated;
revoke execute on function public.zoart_enforce_project_rules() from public, anon, authenticated;
grant execute on function public.zoart_approved_application_url(text) to service_role;
grant execute on function public.zoart_enforce_project_rules() to service_role;


notify pgrst, 'reload schema';
commit;


-- These results confirm the setup ran; they do not expose visitor identities.
select 'Database setup complete' as result,
       (select count(*) from public.projects) as projects_preserved,
       (select count(*) from public.project_tag_catalog) as approved_tags;
select
  has_table_privilege('anon', 'public.projects', 'select') as public_projects_readable,
  has_table_privilege('anon', 'public.projects', 'insert') as public_project_writes_should_be_false,
  has_table_privilege('anon', 'public.project_likes', 'select') as public_visitor_reads_should_be_false;

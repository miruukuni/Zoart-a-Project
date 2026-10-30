-- Run this once if you already ran setup.sql before Apply links were added.
-- It adds one optional field and updates project creation. No rows are removed.
begin;
alter table public.projects add column if not exists application_url text;

do $$ begin
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

revoke execute on function public.create_owned_project(jsonb,text[],uuid) from public,anon,authenticated;
grant execute on function public.create_owned_project(jsonb,text[],uuid) to service_role;
notify pgrst, 'reload schema';
commit;

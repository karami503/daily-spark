create table if not exists public.daily_spark_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  day date not null,
  refresh_count integer not null default 0 check (refresh_count between 0 and 3),
  mission jsonb not null,
  done boolean not null default false,
  history jsonb not null default '[]'::jsonb
);
alter table public.daily_spark_users enable row level security;
revoke all on public.daily_spark_users from anon, authenticated;
grant select on public.daily_spark_users to authenticated;
drop policy if exists spark_read_own on public.daily_spark_users;
create policy spark_read_own on public.daily_spark_users for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.daily_spark_action(p_action text, p_mission jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  today date := (statement_timestamp() at time zone 'Asia/Seoul')::date;
  s public.daily_spark_users%rowtype;
  entry jsonb;
begin
  if uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  if p_action not in ('get', 'refresh', 'complete') or p_action is null then
    raise exception 'INVALID_ACTION';
  end if;
  if p_action in ('get', 'refresh') then
    if p_mission is null or jsonb_typeof(p_mission) <> 'object'
      or not (p_mission ?& array['t','c','e','m','ai'])
      or jsonb_typeof(p_mission->'t') <> 'string' or length(p_mission->>'t') not between 1 and 200
      or jsonb_typeof(p_mission->'c') <> 'string' or p_mission->>'c' not in ('힐링','소통','정리','성장','활력','창의','친절')
      or jsonb_typeof(p_mission->'e') <> 'string' or length(p_mission->>'e') not between 1 and 32
      or jsonb_typeof(p_mission->'m') <> 'string' or length(p_mission->>'m') not between 1 and 40
      or jsonb_typeof(p_mission->'ai') <> 'boolean'
      or pg_column_size(p_mission) > 2048 then raise exception 'INVALID_MISSION'; end if;
  end if;
  if p_action = 'get' then
    insert into public.daily_spark_users(user_id, day, mission)
      values(uid, today, p_mission) on conflict do nothing;
  end if;
  select * into s from public.daily_spark_users where user_id = uid for update;
  if not found then raise exception 'LOAD_FIRST'; end if;
  if s.day <> today then
    s.day := today; s.refresh_count := 0; s.done := false;
  end if;
  if p_action = 'refresh' then
    if s.done then raise exception 'ALREADY_DONE'; end if;
    if s.refresh_count >= 3 then raise exception 'DAILY_LIMIT'; end if;
    if s.mission->>'t' = p_mission->>'t' then raise exception 'SAME_MISSION'; end if;
    s.mission := p_mission; s.refresh_count := s.refresh_count + 1;
  elsif p_action = 'complete' then
    if s.done then raise exception 'ALREADY_DONE'; end if;
    if p_mission is distinct from s.mission then raise exception 'MISSION_CHANGED'; end if;
    s.done := true;
    entry := jsonb_build_object('date',today::text, 'mission',s.mission->>'t',
      'emoji',s.mission->>'e', 'category',s.mission->>'c', 'ai',s.mission->'ai',
      'at',statement_timestamp());
    s.history := s.history || jsonb_build_array(entry);
  end if;
  update public.daily_spark_users set day=s.day, refresh_count=s.refresh_count,
    mission=s.mission, done=s.done, history=s.history where user_id=uid
    and (day,refresh_count,mission,done,history) is distinct from
        (s.day,s.refresh_count,s.mission,s.done,s.history);
  return jsonb_build_object('tKey',s.day::text,'refreshCount',s.refresh_count,
    'tMission',s.mission,'tDone',s.done,'hist',s.history);
end;
$$;
revoke all on function public.daily_spark_action(text,jsonb) from public, anon;
grant execute on function public.daily_spark_action(text,jsonb) to authenticated;

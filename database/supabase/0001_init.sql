-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — Supabase (Postgres) schema
-- Run in: Supabase Dashboard → SQL Editor (or `supabase db push`)
--
-- Replaces the PHP/MySQL backend (see database/schema.sql for the original)
-- so the whole site can be statically hosted on GitHub Pages — everything
-- here is reachable directly from client-side JS via supabase-js, with Row
-- Level Security replacing the PHP endpoints' manual authorization checks.
--
-- Ports: users→auth.users (Supabase-managed), profiles, schools,
-- school_members, classes, students — same shape as the PHP schema.
-- New: class_assignments (teacher "assign games"), parent_links,
-- parental_controls (new parent role, not present in the PHP backend).
-- Dropped entirely: auth_tokens, sessions (Supabase Auth owns these now),
-- stripe_subscriptions, premium_until (no Stripe per the current direction).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  role               text not null default 'player' check (role in ('player','teacher','student','parent')),
  display_name       text,
  coins              int not null default 0 check (coins >= 0),
  active_card_back   text not null default 'cardBack_blue1',
  owned_card_backs   jsonb not null default '["cardBack_blue1"]'::jsonb,
  wins               int not null default 0 check (wins >= 0),
  losses             int not null default 0 check (losses >= 0),
  games_played       int not null default 0 check (games_played >= 0),
  best_streak        int not null default 0 check (best_streak >= 0),
  current_streak     int not null default 0 check (current_streak >= 0),
  xp                 int not null default 0 check (xp >= 0),
  daily_streak       int not null default 0 check (daily_streak >= 0),
  best_daily_streak  int not null default 0 check (best_daily_streak >= 0),
  last_played_date   date,
  badges             jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_profiles_xp on public.profiles (xp desc);

-- Auto-create a profile row whenever a new auth user is created (mirrors
-- the PHP backend's ensure_profile(), event-driven instead of
-- called-on-every-request).
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Schools / classes / students ─────────────────────────────────────────────
create table public.schools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  invite_code   text not null unique,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table public.school_members (
  school_id  uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'teacher' check (role in ('owner','teacher')),
  joined_at  timestamptz not null default now(),
  primary key (school_id, teacher_id)
);

create table public.classes (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  join_code  text not null unique,
  created_at timestamptz not null default now()
);

create index idx_classes_school on public.classes (school_id);

-- family_code: shown on the student's own dashboard ("share this with a
-- parent") — generated once, at join time, by join_class() below.
create table public.students (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  family_code text unique,
  joined_at   timestamptz not null default now()
);

create index idx_students_class on public.students (class_id);

-- ── Class assignments (teacher "assign games") ──────────────────────────────
create table public.class_assignments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  game_id     text not null,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (class_id, game_id)
);

-- ── Parent links + controls ──────────────────────────────────────────────────
create table public.parent_links (
  parent_id  uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  linked_at  timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create table public.parental_controls (
  student_id               uuid primary key references public.students(user_id) on delete cascade,
  daily_time_limit_minutes int check (daily_time_limit_minutes is null or daily_time_limit_minutes > 0),
  blocked_game_ids         jsonb not null default '[]'::jsonb,
  updated_by               uuid references auth.users(id),
  updated_at               timestamptz not null default now()
);

create trigger parental_controls_set_updated_at
  before update on public.parental_controls
  for each row execute function public.set_updated_at();

-- ── RLS helper functions (SECURITY DEFINER so they bypass RLS on the
-- tables they check internally — the standard Postgres/Supabase pattern
-- for avoiding recursive-policy evaluation) ─────────────────────────────────
create function public.is_school_member(p_school_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.school_members
    where school_id = p_school_id and teacher_id = auth.uid()
  );
$$;

create function public.is_linked_parent(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.parent_links
    where student_id = p_student_id and parent_id = auth.uid()
  );
$$;

create function public.is_class_school_member(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.classes c
    join public.school_members sm on sm.school_id = c.school_id
    where c.id = p_class_id and sm.teacher_id = auth.uid()
  );
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_assignments enable row level security;
alter table public.parent_links enable row level security;
alter table public.parental_controls enable row level security;

-- profiles: owner reads/writes own row (client-trusted write model, same
-- trust boundary the PHP profile/update.php endpoint already had — no
-- server-side value validation, just an ownership check).
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- profiles: a teacher can read a student's profile if that student is in a
-- class within a school the teacher belongs to (mirrors the PHP
-- "any school member sees every class" rule).
create policy profiles_select_by_teacher on public.profiles for select using (
  exists (
    select 1 from public.students st
    where st.user_id = profiles.id and public.is_class_school_member(st.class_id)
  )
);

-- profiles: a linked parent can read their child's profile.
create policy profiles_select_by_parent on public.profiles for select using (
  exists (
    select 1 from public.students st
    where st.user_id = profiles.id and public.is_linked_parent(st.user_id)
  )
);

-- schools: members can read; insert only as your own school (create_school()
-- RPC below is the real entry point, this is just the underlying grant).
create policy schools_select_member on public.schools for select using (public.is_school_member(id));
create policy schools_insert_self on public.schools for insert with check (owner_user_id = auth.uid());

create policy school_members_select on public.school_members for select using (public.is_school_member(school_id));

create policy classes_select_member on public.classes for select using (public.is_school_member(school_id));
create policy classes_insert_member on public.classes for insert with check (public.is_school_member(school_id) and teacher_id = auth.uid());

-- students: self, teachers in the same school, and linked parents — never
-- other students (mirrors class/mine.php never leaking classmates' rows).
create policy students_select_self on public.students for select using (auth.uid() = user_id);
create policy students_select_teacher on public.students for select using (public.is_class_school_member(class_id));
create policy students_select_parent on public.students for select using (public.is_linked_parent(user_id));

create policy class_assignments_select on public.class_assignments for select using (
  public.is_class_school_member(class_id)
  or exists (select 1 from public.students st where st.user_id = auth.uid() and st.class_id = class_assignments.class_id)
);

create policy parent_links_select_parent on public.parent_links for select using (auth.uid() = parent_id);
create policy parent_links_select_student on public.parent_links for select using (auth.uid() = student_id);

-- parental_controls: the student can read their own (so the client can
-- enforce them); only a linked parent can write.
create policy parental_controls_select_student on public.parental_controls for select using (auth.uid() = student_id);
create policy parental_controls_select_parent on public.parental_controls for select using (public.is_linked_parent(student_id));
create policy parental_controls_insert_parent on public.parental_controls for insert with check (public.is_linked_parent(student_id));
create policy parental_controls_update_parent on public.parental_controls for update using (public.is_linked_parent(student_id)) with check (public.is_linked_parent(student_id));

-- ── Code generation (mirrors the PHP backend's random_code()/unique_code():
-- alphabet excludes visually-ambiguous 0/O/1/I/L, "kids type these") ────────
create function public.gen_code(p_len int)
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..p_len loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

-- ── RPCs (transactional multi-step operations, SECURITY DEFINER) ───────────

-- One-way role promotion, mirrors promote_to_teacher()/would-be
-- promote_to_parent() in the PHP backend — never downgrades an existing
-- teacher/student/parent back to 'player'.
create function public.promote_to_teacher(p_user_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.profiles set role = 'teacher' where id = p_user_id and role = 'player';
$$;

create function public.promote_to_parent(p_user_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.profiles set role = 'parent' where id = p_user_id and role = 'player';
$$;

create function public.create_school(p_name text)
returns public.schools
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_school public.schools;
  v_tries int := 0;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  loop
    v_code := public.gen_code(8);
    v_tries := v_tries + 1;
    exit when not exists (select 1 from public.schools where invite_code = v_code) or v_tries > 20;
  end loop;
  if v_tries > 20 then raise exception 'Could not generate a unique invite code'; end if;

  insert into public.schools (name, invite_code, owner_user_id)
  values (trim(substr(p_name, 1, 120)), v_code, auth.uid())
  returning * into v_school;

  insert into public.school_members (school_id, teacher_id, role)
  values (v_school.id, auth.uid(), 'owner');

  perform public.promote_to_teacher(auth.uid());

  return v_school;
end;
$$;

-- Idempotent: joining a school you're already in is a harmless no-op,
-- mirrors the PHP endpoint's ON DUPLICATE KEY UPDATE behavior.
create function public.join_school(p_invite_code text)
returns public.schools
language plpgsql security definer set search_path = public as $$
declare
  v_school public.schools;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select * into v_school from public.schools where invite_code = upper(trim(p_invite_code));
  if not found then raise exception 'Invite code not found'; end if;

  insert into public.school_members (school_id, teacher_id, role)
  values (v_school.id, auth.uid(), 'teacher')
  on conflict (school_id, teacher_id) do nothing;

  perform public.promote_to_teacher(auth.uid());

  return v_school;
end;
$$;

create function public.create_class(p_school_id uuid, p_name text)
returns public.classes
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_class public.classes;
  v_tries int := 0;
begin
  if not public.is_school_member(p_school_id) then raise exception 'Forbidden'; end if;

  loop
    v_code := public.gen_code(6);
    v_tries := v_tries + 1;
    exit when not exists (select 1 from public.classes where join_code = v_code) or v_tries > 20;
  end loop;
  if v_tries > 20 then raise exception 'Could not generate a unique join code'; end if;

  insert into public.classes (school_id, teacher_id, name, join_code)
  values (p_school_id, auth.uid(), trim(substr(p_name, 1, 80)), v_code)
  returning * into v_class;

  return v_class;
end;
$$;

-- Call this AFTER supabase.auth.signInAnonymously() on the client — the
-- caller must already have a session (anonymous is fine) before joining.
-- One class per student, same as the PHP schema's students.user_id PK.
create function public.join_class(p_join_code text, p_display_name text)
returns table (class_name text, school_name text, family_code text)
language plpgsql security definer set search_path = public as $$
declare
  v_class public.classes;
  v_school_name text;
  v_family_code text;
  v_tries int := 0;
  v_clean_name text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.students where user_id = auth.uid()) then
    raise exception 'Already in a class';
  end if;

  select c.* into v_class from public.classes c where c.join_code = upper(trim(p_join_code));
  if not found then raise exception 'Class code not found'; end if;
  select s.name into v_school_name from public.schools s where s.id = v_class.school_id;

  v_clean_name := left(trim(regexp_replace(p_display_name, '[^[:alnum:][:space:]_.''\-]', '', 'g')), 24);
  if v_clean_name = '' then raise exception 'A display name is required'; end if;

  loop
    v_family_code := public.gen_code(6);
    v_tries := v_tries + 1;
    exit when not exists (select 1 from public.students where family_code = v_family_code) or v_tries > 20;
  end loop;

  insert into public.profiles (id, role, display_name)
  values (auth.uid(), 'student', v_clean_name)
  on conflict (id) do update set role = 'student', display_name = excluded.display_name;

  insert into public.students (user_id, class_id, family_code)
  values (auth.uid(), v_class.id, v_family_code);

  return query select v_class.name, v_school_name, v_family_code;
end;
$$;

-- Links the (already signed-in) caller as a parent of the student who owns
-- this family_code.
create function public.link_parent(p_family_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select user_id into v_student_id from public.students where family_code = upper(trim(p_family_code));
  if not found then raise exception 'Family code not found'; end if;

  insert into public.parent_links (parent_id, student_id) values (auth.uid(), v_student_id)
  on conflict do nothing;

  perform public.promote_to_parent(auth.uid());
end;
$$;

create function public.assign_game(p_class_id uuid, p_game_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_class_school_member(p_class_id) then raise exception 'Forbidden'; end if;
  insert into public.class_assignments (class_id, game_id, assigned_by)
  values (p_class_id, p_game_id, auth.uid())
  on conflict (class_id, game_id) do nothing;
end;
$$;

-- Student's own rank/size/avg only — never other students' rows, mirrors
-- class/mine.php's deliberately minimal response shape.
create function public.my_class_standing()
returns table (in_class boolean, class_name text, school_name text, rank int, class_size int, avg_xp numeric, my_xp int)
language plpgsql security definer set search_path = public as $$
declare
  v_class_id uuid;
begin
  select st.class_id into v_class_id from public.students st where st.user_id = auth.uid();
  if v_class_id is null then
    return query select false, null::text, null::text, null::int, null::int, null::numeric, null::int;
    return;
  end if;

  return query
    with ranked as (
      select st.user_id, p.xp,
             row_number() over (order by p.xp desc) as rnk,
             count(*) over () as sz,
             avg(p.xp) over () as avgxp
      from public.students st join public.profiles p on p.id = st.user_id
      where st.class_id = v_class_id
    )
    select true, c.name, s.name, r.rnk::int, r.sz::int, r.avgxp, r.xp
    from ranked r
    join public.classes c on c.id = v_class_id
    join public.schools s on s.id = c.school_id
    where r.user_id = auth.uid();
end;
$$;

-- Public leaderboard — top 20 by xp. Students are excluded on purpose
-- (child safety: no anonymous public surface should expose kids' names —
-- a student's standing is only visible to their own teacher/parent),
-- mirrors profile/leaderboard.php exactly.
create function public.public_leaderboard()
returns table (display_name text, xp int, level int)
language sql stable security definer set search_path = public as $$
  select display_name, xp, (floor(sqrt(xp / 100.0)) + 1)::int as level
  from public.profiles
  where display_name is not null and display_name <> '' and xp > 0 and role <> 'student'
  order by xp desc
  limit 20;
$$;

-- ── Read RPCs ────────────────────────────────────────────────────────────
-- Replicating these via raw PostgREST joins from the client would be
-- fragile (PostgREST's query builder doesn't do AVG/aggregation well) —
-- these mirror the PHP endpoints' exact response shapes as single JSONB
-- payloads instead, so the TypeScript client stays a thin, reliable
-- pass-through rather than reconstructing joins/aggregates itself.

-- list_schools() — one row per (school, class) the caller belongs to;
-- the client groups these into the nested SchoolSummary[] shape. Mirrors
-- school/list.php.
create function public.list_schools()
returns table (
  school_id uuid, school_name text, invite_code text, my_role text,
  class_id uuid, class_name text, join_code text, is_mine boolean,
  student_count bigint, avg_xp numeric
)
language sql stable security definer set search_path = public as $$
  select
    s.id, s.name, s.invite_code, sm.role,
    c.id, c.name, c.join_code, (c.teacher_id = auth.uid()),
    coalesce(cnt.student_count, 0), coalesce(cnt.avg_xp, 0)
  from public.school_members sm
  join public.schools s on s.id = sm.school_id
  left join public.classes c on c.school_id = s.id
  left join lateral (
    select count(*) as student_count, avg(p.xp) as avg_xp
    from public.students st join public.profiles p on p.id = st.user_id
    where st.class_id = c.id
  ) cnt on true
  where sm.teacher_id = auth.uid()
  order by s.name, c.name;
$$;

-- school_dashboard(school_id) — per-class stats + top-5/bottom-5 students
-- school-wide. Explicit membership check (raises, PostgREST surfaces as an
-- error) so a non-member can't probe existence, mirrors school/dashboard.php.
create function public.school_dashboard(p_school_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_school public.schools;
  v_classes jsonb;
  v_top jsonb;
  v_bottom jsonb;
begin
  if not public.is_school_member(p_school_id) then raise exception 'Forbidden'; end if;

  select * into v_school from public.schools where id = p_school_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'name', c.name,
    'student_count', coalesce(cnt.student_count, 0),
    'avg_xp', coalesce(cnt.avg_xp, 0)
  )), '[]'::jsonb)
  into v_classes
  from public.classes c
  left join lateral (
    select count(*) as student_count, avg(p.xp) as avg_xp
    from public.students st join public.profiles p on p.id = st.user_id
    where st.class_id = c.id
  ) cnt on true
  where c.school_id = p_school_id;

  select coalesce(jsonb_agg(jsonb_build_object('display_name', x.display_name, 'xp', x.xp, 'class_name', x.class_name)), '[]'::jsonb)
  into v_top
  from (
    select p.display_name, p.xp, c.name as class_name
    from public.students st
    join public.profiles p on p.id = st.user_id
    join public.classes c on c.id = st.class_id
    where c.school_id = p_school_id
    order by p.xp desc limit 5
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object('display_name', x.display_name, 'xp', x.xp, 'class_name', x.class_name)), '[]'::jsonb)
  into v_bottom
  from (
    select p.display_name, p.xp, c.name as class_name
    from public.students st
    join public.profiles p on p.id = st.user_id
    join public.classes c on c.id = st.class_id
    where c.school_id = p_school_id
    order by p.xp asc limit 5
  ) x;

  return jsonb_build_object(
    'school', jsonb_build_object('id', v_school.id, 'name', v_school.name, 'invite_code', v_school.invite_code),
    'classes', v_classes,
    'top_students', v_top,
    'bottom_students', v_bottom
  );
end;
$$;

-- class_roster(class_id) — full roster sorted by xp desc, mirrors
-- class/roster.php ("Unnamed student" fallback included).
create function public.class_roster(p_class_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_class public.classes;
  v_students jsonb;
  v_avg numeric;
begin
  if not public.is_class_school_member(p_class_id) then raise exception 'Forbidden'; end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found then raise exception 'Class not found'; end if;

  select avg(p.xp) into v_avg
  from public.students st join public.profiles p on p.id = st.user_id
  where st.class_id = p_class_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'display_name', coalesce(p.display_name, 'Unnamed student'),
    'xp', p.xp, 'level', (floor(sqrt(p.xp / 100.0)) + 1)::int,
    'daily_streak', p.daily_streak, 'badge_count', jsonb_array_length(p.badges),
    'joined_at', st.joined_at
  ) order by p.xp desc), '[]'::jsonb)
  into v_students
  from public.students st join public.profiles p on p.id = st.user_id
  where st.class_id = p_class_id;

  return jsonb_build_object(
    'class', jsonb_build_object('id', v_class.id, 'name', v_class.name, 'join_code', v_class.join_code, 'is_mine', v_class.teacher_id = auth.uid()),
    'students', v_students,
    'avg_xp', coalesce(v_avg, 0)
  );
end;
$$;

-- my_children() — for the parent dashboard: every linked student's report
-- card. A parent can only ever see students they hold a parent_links row
-- for (enforced here explicitly, redundant with but matching the RLS
-- policies on the underlying tables).
create function public.my_children()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'student_id', st.user_id,
    'display_name', p.display_name,
    'xp', p.xp, 'level', (floor(sqrt(p.xp / 100.0)) + 1)::int,
    'daily_streak', p.daily_streak, 'best_daily_streak', p.best_daily_streak,
    'badges', p.badges,
    'class_name', c.name, 'school_name', s.name
  )), '[]'::jsonb)
  from public.parent_links pl
  join public.students st on st.user_id = pl.student_id
  join public.profiles p on p.id = st.user_id
  join public.classes c on c.id = st.class_id
  join public.schools s on s.id = c.school_id
  where pl.parent_id = auth.uid();
$$;

-- list_class_assignments(class_id) — games currently assigned to a class,
-- readable by the class's school members and by students in that class
-- (RLS on class_assignments already allows both; this just returns the
-- game_id list in a convenient shape for the UI).
create function public.list_class_assignments(p_class_id uuid)
returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(game_id order by assigned_at), array[]::text[])
  from public.class_assignments
  where class_id = p_class_id
    and (public.is_class_school_member(p_class_id)
         or exists (select 1 from public.students st where st.user_id = auth.uid() and st.class_id = p_class_id));
$$;

grant execute on function public.public_leaderboard() to anon, authenticated;
grant execute on function public.create_school(text) to authenticated;
grant execute on function public.join_school(text) to authenticated;
grant execute on function public.create_class(uuid, text) to authenticated;
grant execute on function public.join_class(text, text) to authenticated;
grant execute on function public.link_parent(text) to authenticated;
grant execute on function public.assign_game(uuid, text) to authenticated;
grant execute on function public.my_class_standing() to authenticated;
grant execute on function public.list_schools() to authenticated;
grant execute on function public.school_dashboard(uuid) to authenticated;
grant execute on function public.class_roster(uuid) to authenticated;
grant execute on function public.my_children() to authenticated;
grant execute on function public.list_class_assignments(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — Supabase schema, part 2
-- Run in: Supabase Dashboard → SQL Editor, AFTER 0001_init.sql
--
-- Additive only — no existing column/table is changed or dropped. Adds:
--  - lenient per-game "report card" data (profiles.game_round_counts)
--  - class announcements (teacher → class + linked parents)
--  - homework due dates on assigned games
--  - attendance tracking
--  - a private teacher note per student
--  - organization type + welcome message (so "School" can read as "Mosque",
--    "Homeschool", etc. — same data model, just a label + note)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles: synced per-game round counts (mirrors how `badges` is already
-- stored as jsonb) — this is the data the lenient Bronze/Silver/Gold/Platinum
-- report card is built from. ─────────────────────────────────────────────────
alter table public.profiles
  add column game_round_counts jsonb not null default '{}'::jsonb;

-- ── schools: organization type + welcome message ────────────────────────────
alter table public.schools
  add column org_type text not null default 'school'
    check (org_type in ('school','mosque','homeschool','other')),
  add column welcome_message text;

create policy schools_update_member on public.schools for update
  using (public.is_school_member(id)) with check (public.is_school_member(id));

-- ── class_assignments: optional homework due date ───────────────────────────
alter table public.class_assignments
  add column due_date date;

create policy class_assignments_update on public.class_assignments for update
  using (public.is_class_school_member(class_id)) with check (public.is_class_school_member(class_id));

-- ── students: private teacher note (never exposed to the student/parent
-- read paths — my_children() and the student's own profile RPCs simply
-- never select this column). ─────────────────────────────────────────────────
alter table public.students
  add column teacher_note text;

create policy students_update_teacher_note on public.students for update
  using (public.is_class_school_member(class_id)) with check (public.is_class_school_member(class_id));

-- ── Class announcements ──────────────────────────────────────────────────────
create table public.class_announcements (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  message    text not null check (char_length(trim(message)) > 0 and char_length(message) <= 500),
  created_at timestamptz not null default now()
);

create index idx_class_announcements_class on public.class_announcements (class_id, created_at desc);

alter table public.class_announcements enable row level security;

create policy class_announcements_select on public.class_announcements for select using (
  public.is_class_school_member(class_id)
  or exists (select 1 from public.students st where st.user_id = auth.uid() and st.class_id = class_announcements.class_id)
  or exists (
    select 1 from public.students st
    where st.class_id = class_announcements.class_id and public.is_linked_parent(st.user_id)
  )
);

create policy class_announcements_insert on public.class_announcements for insert with check (
  public.is_class_school_member(class_id) and teacher_id = auth.uid()
);

create policy class_announcements_delete on public.class_announcements for delete using (
  teacher_id = auth.uid()
);

-- ── Attendance ────────────────────────────────────────────────────────────────
create table public.class_attendance (
  class_id     uuid not null references public.classes(id) on delete cascade,
  student_id   uuid not null references public.students(user_id) on delete cascade,
  session_date date not null,
  present      boolean not null default false,
  marked_by    uuid references auth.users(id),
  marked_at    timestamptz not null default now(),
  primary key (class_id, student_id, session_date)
);

create index idx_class_attendance_student on public.class_attendance (student_id);

alter table public.class_attendance enable row level security;

-- Select-only policies — all writes go through mark_attendance() below
-- (SECURITY DEFINER, bypasses RLS internally), so there's no direct
-- insert/update grant here on purpose.
create policy class_attendance_select_teacher on public.class_attendance for select using (
  public.is_class_school_member(class_id)
);
create policy class_attendance_select_student on public.class_attendance for select using (
  auth.uid() = student_id
);
create policy class_attendance_select_parent on public.class_attendance for select using (
  public.is_linked_parent(student_id)
);

-- Upserts present=true for the given roster ids and present=false for
-- every other student in that class on that date — one call per taken
-- session, mirrors how a paper attendance sheet works.
create function public.mark_attendance(p_class_id uuid, p_session_date date, p_present_user_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_class_school_member(p_class_id) then raise exception 'Forbidden'; end if;

  insert into public.class_attendance (class_id, student_id, session_date, present, marked_by, marked_at)
  select p_class_id, st.user_id, p_session_date, (st.user_id = any(p_present_user_ids)), auth.uid(), now()
  from public.students st
  where st.class_id = p_class_id
  on conflict (class_id, student_id, session_date)
  do update set present = excluded.present, marked_by = excluded.marked_by, marked_at = excluded.marked_at;
end;
$$;

grant execute on function public.mark_attendance(uuid, date, uuid[]) to authenticated;

-- ── Extend read RPCs with the new report-card / attendance / note fields ────

-- class_roster(class_id) — teacher-facing only, so this is the one place
-- teacher_note is ever selected.
create or replace function public.class_roster(p_class_id uuid)
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
    'student_id', st.user_id,
    'display_name', coalesce(p.display_name, 'Unnamed student'),
    'xp', p.xp, 'level', (floor(sqrt(p.xp / 100.0)) + 1)::int,
    'daily_streak', p.daily_streak, 'badge_count', jsonb_array_length(p.badges),
    'joined_at', st.joined_at,
    'game_round_counts', p.game_round_counts,
    'last_played_date', p.last_played_date,
    'teacher_note', st.teacher_note,
    'attendance_pct', att.pct
  ) order by p.xp desc), '[]'::jsonb)
  into v_students
  from public.students st
  join public.profiles p on p.id = st.user_id
  left join lateral (
    select case when count(*) = 0 then null else round(100.0 * count(*) filter (where present) / count(*), 0) end as pct
    from public.class_attendance ca where ca.student_id = st.user_id and ca.class_id = p_class_id
  ) att on true
  where st.class_id = p_class_id;

  return jsonb_build_object(
    'class', jsonb_build_object('id', v_class.id, 'name', v_class.name, 'join_code', v_class.join_code, 'is_mine', v_class.teacher_id = auth.uid()),
    'students', v_students,
    'avg_xp', coalesce(v_avg, 0)
  );
end;
$$;

-- my_children() — parent-facing. Deliberately does NOT select teacher_note.
create or replace function public.my_children()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'student_id', st.user_id,
    'display_name', p.display_name,
    'xp', p.xp, 'level', (floor(sqrt(p.xp / 100.0)) + 1)::int,
    'daily_streak', p.daily_streak, 'best_daily_streak', p.best_daily_streak,
    'badges', p.badges,
    'game_round_counts', p.game_round_counts,
    'last_played_date', p.last_played_date,
    'class_id', st.class_id,
    'class_name', c.name, 'school_name', s.name,
    'attendance_pct', att.pct
  )), '[]'::jsonb)
  from public.parent_links pl
  join public.students st on st.user_id = pl.student_id
  join public.profiles p on p.id = st.user_id
  join public.classes c on c.id = st.class_id
  join public.schools s on s.id = c.school_id
  left join lateral (
    select case when count(*) = 0 then null else round(100.0 * count(*) filter (where present) / count(*), 0) end as pct
    from public.class_attendance ca where ca.student_id = st.user_id
  ) att on true
  where pl.parent_id = auth.uid();
$$;

-- list_class_assignments(class_id) — now returns due_date alongside game_id
-- (was text[], now a table) so the UI can render due/overdue chips.
drop function if exists public.list_class_assignments(uuid);

create function public.list_class_assignments(p_class_id uuid)
returns table (game_id text, due_date date)
language sql stable security definer set search_path = public as $$
  select ca.game_id, ca.due_date
  from public.class_assignments ca
  where ca.class_id = p_class_id
    and (public.is_class_school_member(p_class_id)
         or exists (select 1 from public.students st where st.user_id = auth.uid() and st.class_id = p_class_id))
  order by ca.assigned_at;
$$;

grant execute on function public.list_class_assignments(uuid) to authenticated;

-- my_class_standing() — extended to also return the school's welcome
-- message/org type, so a student (who has no direct read access to
-- `schools` — only school_members/teachers do) can see it via this
-- already-SECURITY-DEFINER, student-facing RPC instead of a new grant.
-- Return shape changed (2 new columns), so this must be dropped first —
-- CREATE OR REPLACE FUNCTION cannot change a function's OUT-parameter row type.
drop function if exists public.my_class_standing();

create function public.my_class_standing()
returns table (
  in_class boolean, class_name text, school_name text, rank int, class_size int, avg_xp numeric, my_xp int,
  org_type text, welcome_message text
)
language plpgsql security definer set search_path = public as $$
declare
  v_class_id uuid;
begin
  select st.class_id into v_class_id from public.students st where st.user_id = auth.uid();
  if v_class_id is null then
    return query select false, null::text, null::text, null::int, null::int, null::numeric, null::int, null::text, null::text;
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
    select true, c.name, s.name, r.rnk::int, r.sz::int, r.avgxp, r.xp, s.org_type, s.welcome_message
    from ranked r
    join public.classes c on c.id = v_class_id
    join public.schools s on s.id = c.school_id
    where r.user_id = auth.uid();
end;
$$;

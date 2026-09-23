-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — Supabase schema, part 4
-- Run in: Supabase Dashboard → SQL Editor, AFTER 0003_rate_limit_and_reports.sql
--
-- Inactivity warning + cleanup for individual teacher/parent accounts (not
-- the Supabase *project's* own idle-pause behavior). After 3 months with no
-- sign-in, a warning email goes out; if still inactive 30 days after that,
-- the account's PII is anonymized.
--
-- auth.users is NEVER deleted here. schools.owner_user_id and
-- classes.teacher_id both CASCADE from auth.users, so deleting a teacher's
-- auth row would silently destroy their whole school/class and every
-- enrolled student's school-side data (attendance, assignments, parent
-- links) even though the students' own accounts would survive. A teacher
-- who still owns/co-runs a school or teaches a class is instead flagged for
-- manual review (needs_manual_review) and left otherwise untouched.
--
-- Scoped to role in ('teacher','parent') only — students are anonymous
-- (no email), and 'player' accounts are out of scope for this feature.
-- All three functions below are deliberately ungranted to anon/authenticated
-- (same "no grant = service-role-only" convention as the trigger functions
-- in 0001_init.sql): only the scheduled job, calling in with the service
-- role key, can invoke them.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column inactivity_warned_at timestamptz,
  add column needs_manual_review boolean not null default false;

-- auth.users.last_sign_in_at isn't exposed via PostgREST directly — this
-- wraps it for reuse (scan_inactive_accounts below, and any future admin UI).
create function public.last_sign_in(p_user_id uuid)
returns timestamptz
language sql security definer set search_path = public as $$
  select last_sign_in_at from auth.users where id = p_user_id;
$$;

-- Two result sets in one call: accounts newly crossing 3-months-inactive
-- that haven't been warned yet ('warn'), and accounts that were warned 30+
-- days ago and are still inactive since that warning ('cleanup'). Accounts
-- already flagged for manual review are excluded from both — a human, not
-- this job, decides what happens to them next.
create function public.scan_inactive_accounts()
returns table (
  user_id      uuid,
  email        text,
  role         text,
  display_name text,
  action       text
)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select u.id, u.email::text, p.role, p.display_name, 'warn'::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role in ('teacher', 'parent')
    and u.email is not null
    and p.inactivity_warned_at is null
    and p.needs_manual_review = false
    and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '3 months';

  return query
  select u.id, u.email::text, p.role, p.display_name, 'cleanup'::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role in ('teacher', 'parent')
    and u.email is not null
    and p.inactivity_warned_at is not null
    and p.needs_manual_review = false
    and coalesce(u.last_sign_in_at, u.created_at) < p.inactivity_warned_at
    and p.inactivity_warned_at < now() - interval '30 days';
end;
$$;

-- Anonymizes a teacher/parent's own PII. A teacher who still owns a school,
-- is a school_members row (owner or co-teacher), or teaches a class is left
-- untouched and flagged instead — cleaning them up would silently orphan
-- every enrolled student's school-side data. Parents have no such ownership
-- concern, so they're anonymized directly.
create function public.cleanup_inactive_account(p_user_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_owns_school boolean;
begin
  select role into v_role from public.profiles where id = p_user_id;
  if v_role is null then raise exception 'No such profile'; end if;

  if v_role = 'teacher' then
    select exists(
      select 1 from public.schools where owner_user_id = p_user_id
      union all
      select 1 from public.school_members where teacher_id = p_user_id
      union all
      select 1 from public.classes where teacher_id = p_user_id
    ) into v_owns_school;

    if v_owns_school then
      update public.profiles set needs_manual_review = true where id = p_user_id;
      return 'flagged';
    end if;
  end if;

  update public.profiles set display_name = 'Deactivated account' where id = p_user_id;
  delete from public.parent_links where parent_id = p_user_id;

  return 'cleaned';
end;
$$;

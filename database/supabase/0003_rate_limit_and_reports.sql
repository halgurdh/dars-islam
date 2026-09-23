-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — Supabase schema, part 3
-- Run in: Supabase Dashboard → SQL Editor, AFTER 0002_features.sql
--
-- Additive only — no existing column/table is changed or dropped. Adds:
--  - a per-session attempt log + threshold check on join_class/link_parent,
--    since a 6-char join/family code (32-symbol alphabet, ~1.07B combos) had
--    zero brute-force protection until now
--  - a content_reports table so a parent/teacher/student can flag a bad
--    announcement or a factual/content problem in a game, without needing
--    an account or emailing the site owner directly
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Rate limiting ───────────────────────────────────────────────────────────
-- No RLS policies at all on purpose: this table is never read or written
-- directly by clients, only by the SECURITY DEFINER functions below (which
-- bypass RLS internally), same spirit as class_attendance's "writes only via
-- a SECURITY DEFINER function" convention in 0002_features.sql.
create table public.code_attempt_log (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
  rpc_name     text not null,
  attempted_at timestamptz not null default now()
);

create index idx_code_attempt_log_user_rpc_time on public.code_attempt_log (user_id, rpc_name, attempted_at);

alter table public.code_attempt_log enable row level security;

-- Client calls this immediately before join_class/link_parent, in its own
-- RPC round-trip (its own transaction) — so the logged attempt survives even
-- when the very next call fails and raises an exception. (A single function
-- can't do "insert log row, then raise exception" and have the insert stick:
-- an uncaught exception aborts the whole transaction, undoing everything the
-- function did in that same invocation, including the log insert.)
create function public.record_code_attempt(p_rpc_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  delete from public.code_attempt_log where user_id = auth.uid() and attempted_at < now() - interval '1 day';

  insert into public.code_attempt_log (user_id, rpc_name) values (auth.uid(), p_rpc_name);
end;
$$;

grant execute on function public.record_code_attempt(text) to authenticated;

-- join_class / link_parent: unchanged return contracts, unchanged error
-- messages for existing failure cases — just one extra read-only check
-- (safe under rollback, since it writes nothing) as the first statement
-- after the existing auth check.
create or replace function public.join_class(p_join_code text, p_display_name text)
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

  if (
    select count(*) from public.code_attempt_log
    where user_id = auth.uid() and rpc_name = 'join_class' and attempted_at > now() - interval '10 minutes'
  ) >= 8 then
    raise exception 'Too many attempts. Please wait a few minutes and try again.';
  end if;

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

create or replace function public.link_parent(p_family_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  if (
    select count(*) from public.code_attempt_log
    where user_id = auth.uid() and rpc_name = 'link_parent' and attempted_at > now() - interval '10 minutes'
  ) >= 8 then
    raise exception 'Too many attempts. Please wait a few minutes and try again.';
  end if;

  select user_id into v_student_id from public.students where family_code = upper(trim(p_family_code));
  if not found then raise exception 'Family code not found'; end if;

  insert into public.parent_links (parent_id, student_id) values (auth.uid(), v_student_id)
  on conflict do nothing;

  perform public.promote_to_parent(auth.uid());
end;
$$;

-- ── Content reporting ───────────────────────────────────────────────────────
-- Insert-only from the client, open to anon too (reporting bad content
-- shouldn't require signing in first). No select/update/delete policy — the
-- site owner reviews these directly in the Supabase table editor, same as
-- class_announcements has no in-app moderation path today.
create table public.content_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('announcement', 'game')),
  target_id   text not null,
  reason      text not null check (char_length(trim(reason)) > 0 and char_length(reason) <= 500),
  created_at  timestamptz not null default now()
);

alter table public.content_reports enable row level security;

create policy content_reports_insert on public.content_reports for insert
  with check (reporter_id is not distinct from auth.uid());

grant insert on public.content_reports to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — Supabase schema, part 5: security hardening
-- Run in: Supabase Dashboard → SQL Editor, AFTER 0004_inactivity_cleanup.sql
--
-- Fixes four issues found in a security review of the auth/data-sync
-- critical path, confirmed live against this project (Supabase grants
-- EXECUTE on new functions to anon/authenticated by default unless
-- explicitly revoked — nothing in 0001-0004 ever revoked it):
--
--  1. promote_to_teacher/promote_to_parent took a caller-supplied p_user_id
--     with no check that it was the caller's own id — any signed-in user
--     (including an anonymous student session) could flip ANY other user's
--     role. Every legitimate caller already only ever passes auth.uid(), so
--     restricting it to self-service is a pure hardening fix, not a
--     behavior change.
--  2. cleanup_inactive_account/scan_inactive_accounts (0004) were reachable
--     by anon/authenticated despite the comment there claiming otherwise —
--     that comment's assumption about Supabase's default grants was wrong.
--     Only the scheduled job (via the service-role key) should call these.
--  3. join_school's 8-char invite code (grants full teacher access to an
--     entire school) had no rate limiting at all, unlike join_class/
--     link_parent's 6-char codes.
--  4. profiles_update_own's RLS has no column restriction, so a technical
--     user could PATCH their own role directly via PostgREST, bypassing
--     create_school/join_school/join_class/link_parent entirely. A trigger
--     now blocks any client-driven role change; the three functions that
--     legitimately change role set a transaction-local flag first.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Self-service only ────────────────────────────────────────────────────
create or replace function public.promote_to_teacher(p_user_id uuid)
returns void language sql security definer set search_path = public as $$
  select set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = 'teacher' where id = p_user_id and role = 'player' and auth.uid() = p_user_id;
$$;

create or replace function public.promote_to_parent(p_user_id uuid)
returns void language sql security definer set search_path = public as $$
  select set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = 'parent' where id = p_user_id and role = 'player' and auth.uid() = p_user_id;
$$;

-- ── 2. Service-role only ────────────────────────────────────────────────────
revoke execute on function public.cleanup_inactive_account(uuid) from public, anon, authenticated;
revoke execute on function public.scan_inactive_accounts() from public, anon, authenticated;
revoke execute on function public.last_sign_in(uuid) from public, anon, authenticated;

-- ── 3. Rate limiting on join_school, matching join_class/link_parent ───────
create or replace function public.join_school(p_invite_code text)
returns public.schools
language plpgsql security definer set search_path = public as $$
declare
  v_school public.schools;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  if (
    select count(*) from public.code_attempt_log
    where user_id = auth.uid() and rpc_name = 'join_school' and attempted_at > now() - interval '10 minutes'
  ) >= 8 then
    raise exception 'Too many attempts. Please wait a few minutes and try again.';
  end if;

  select * into v_school from public.schools where invite_code = upper(trim(p_invite_code));
  if not found then raise exception 'Invite code not found'; end if;

  insert into public.school_members (school_id, teacher_id, role)
  values (v_school.id, auth.uid(), 'teacher')
  on conflict (school_id, teacher_id) do nothing;

  perform public.promote_to_teacher(auth.uid());

  return v_school;
end;
$$;

-- ── 4. profiles.role can only change via the sanctioned functions ─────────
create or replace function public.prevent_client_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and coalesce(current_setting('app.allow_role_change', true), '') <> 'on' then
    raise exception 'role cannot be changed directly — join a class/school or link as a parent instead';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_client_role_change();

-- join_class is the third (and last) place that sets role directly — needs
-- the same allow-flag as promote_to_teacher/promote_to_parent above, or the
-- trigger just added would block it.
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

  perform set_config('app.allow_role_change', 'on', true);
  insert into public.profiles (id, role, display_name)
  values (auth.uid(), 'student', v_clean_name)
  on conflict (id) do update set role = 'student', display_name = excluded.display_name;

  insert into public.students (user_id, class_id, family_code)
  values (auth.uid(), v_class.id, v_family_code);

  return query select v_class.name, v_school_name, v_family_code;
end;
$$;

-- T2.1/T2.2: a temporary-password session must not reach role-gated data.
-- The account owner can still read their own profile and use the later
-- password-change endpoint; all role-based RLS policies fail closed meanwhile.

create or replace function private.current_active_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.user_id = (select auth.uid())
    and p.status = 'active'::public.account_status
    and p.must_change_password = false
  limit 1;
$$;

revoke all on function private.current_active_role() from public, anon, service_role;
grant execute on function private.current_active_role() to authenticated;

comment on function private.current_active_role() is
  'Returns the protected role only for active users who completed any required temporary-password change.';

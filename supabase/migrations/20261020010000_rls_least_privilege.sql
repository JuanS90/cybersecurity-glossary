-- T1.2: least-privilege access for the Supabase client roles.
-- Profile changes are reserved for the trusted account-management Edge
-- Function in T2.2. Browser clients never receive write privileges on profiles.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;

-- Roles and active status come only from protected profiles, never JWT user
-- metadata that the account holder can change.
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
  limit 1;
$$;

revoke all on function private.current_active_role() from public, anon, service_role;
grant execute on function private.current_active_role() to authenticated;

-- The normalization helper is needed to validate authenticated proposal
-- inserts. The trigger helper is not an API operation and needs no client grant.
revoke all on function public.normalize_glossary_term(text)
  from public, anon, authenticated, service_role;
grant execute on function public.normalize_glossary_term(text) to authenticated;
revoke all on function public.set_updated_at()
  from public, anon, authenticated, service_role;

-- Revoke all table privileges first, including any Supabase default grants.
revoke all privileges on table
  public.profiles,
  public.glossary_entries,
  public.change_proposals,
  public.entry_revisions
from public, anon, authenticated, service_role;

-- Profiles are readable only by the account owner. Provisioning, role changes,
-- status changes and revocation are performed by the trusted T2.2 Edge Function.
grant select on table public.profiles to authenticated;
grant select on table public.profiles to service_role;
grant insert (user_id, display_name, role, status, must_change_password, created_by)
  on table public.profiles to service_role;
grant update (display_name, role, status, must_change_password)
  on table public.profiles to service_role;

-- Every glossary row is approved/public. No client role can write entries
-- directly; the T3.2 approval operation must publish and audit atomically.
grant select on table public.glossary_entries to anon, authenticated;

-- Students and teachers may submit proposals. Submitted identity is explicit
-- and checked against auth.uid(); status/reviewer/timestamps remain server-owned.
grant select on table public.change_proposals to authenticated;
grant insert (operation, entry_id, proposed_data, submitted_by)
  on table public.change_proposals to authenticated;

grant select on table public.entry_revisions to authenticated;

create policy profiles_read_own
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy glossary_entries_public_read
  on public.glossary_entries
  for select
  to anon, authenticated
  using (true);

create policy change_proposals_read_own_or_teacher
  on public.change_proposals
  for select
  to authenticated
  using (
    (select private.current_active_role()) is not null
    and (
      submitted_by = (select auth.uid())
      or (select private.current_active_role()) = 'teacher'::public.app_role
    )
  );

create policy change_proposals_submit_as_student_or_teacher
  on public.change_proposals
  for insert
  to authenticated
  with check (
    submitted_by = (select auth.uid())
    and (select private.current_active_role()) in (
      'student'::public.app_role,
      'teacher'::public.app_role
    )
  );

create policy entry_revisions_read_by_teacher
  on public.entry_revisions
  for select
  to authenticated
  using ((select private.current_active_role()) = 'teacher'::public.app_role);

comment on table public.profiles is
  'Client access is read-only for the owner. Trusted account provisioning and status changes belong to T2.2 Edge Functions.';
comment on table public.glossary_entries is
  'Published glossary content. Client roles are read-only; publishing must use the audited T3.2 database operation.';
comment on table public.change_proposals is
  'Client roles can submit immutable pending proposals and read permitted history. Review state changes are reserved for T3.2.';
comment on table public.entry_revisions is
  'Append-only audit history. Client roles have read-only access; approved revisions are written by the atomic T3.2 database operation.';

-- T3.2 must provide a narrowly granted database function (or equivalent
-- trigger-backed transaction) that verifies an active teacher, locks/validates
-- a pending proposal, applies the entry change, records entry_revisions, and
-- marks the proposal reviewed in one transaction. Do not grant UPDATE on
-- glossary_entries/change_proposals or INSERT/UPDATE/DELETE on entry_revisions:
-- those grants would let a client publish without an audit row.

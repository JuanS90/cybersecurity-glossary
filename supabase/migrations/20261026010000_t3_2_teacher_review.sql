-- T3.2: expose the teacher's pending queue and review each proposal atomically.

alter table public.change_proposals
  add column reviewed_data jsonb,
  add constraint change_proposals_reviewed_data_check
    check (reviewed_data is null or jsonb_typeof(reviewed_data) = 'object');

create or replace function public.list_pending_glossary_proposals()
returns table (
  id uuid,
  operation public.proposal_operation,
  entry_id uuid,
  proposed_data jsonb,
  submitted_by uuid,
  submitted_at timestamptz,
  submitter_name text,
  current_data jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_role public.app_role;
begin
  select p.role into caller_role
  from public.profiles as p
  where p.user_id = (select auth.uid())
    and p.status = 'active'::public.account_status;

  if caller_role is distinct from 'teacher'::public.app_role then
    raise exception using errcode = '42501', message = 'An active teacher account is required.';
  end if;

  return query
  select
    proposal.id,
    proposal.operation,
    proposal.entry_id,
    proposal.proposed_data,
    proposal.submitted_by,
    proposal.submitted_at,
    submitter.display_name,
    case when proposal.operation = 'edit'::public.proposal_operation then
      jsonb_build_object(
        'term', entry.term,
        'translation_es', entry.translation_es,
        'definition_en', entry.definition_en,
        'example_en', entry.example_en,
        'category', entry.category,
        'source_reference', entry.source_reference
      )
    else null end
  from public.change_proposals as proposal
  join public.profiles as submitter on submitter.user_id = proposal.submitted_by
  left join public.glossary_entries as entry on entry.id = proposal.entry_id
  where proposal.status = 'pending'::public.proposal_status
  order by proposal.submitted_at, proposal.id;
end;
$$;

create or replace function public.review_glossary_proposal(
  p_proposal_id uuid,
  p_decision text,
  p_review_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewer_id uuid := (select auth.uid());
  caller_role public.app_role;
  proposal public.change_proposals%rowtype;
  old_entry public.glossary_entries%rowtype;
  new_entry_id uuid;
  next_sort_order integer;
  before_data jsonb;
  after_data jsonb;
  note text := nullif(pg_catalog.btrim(p_review_note), '');
begin
  select p.role into caller_role
  from public.profiles as p
  where p.user_id = reviewer_id
    and p.status = 'active'::public.account_status;

  if caller_role is distinct from 'teacher'::public.app_role then
    raise exception using errcode = '42501', message = 'An active teacher account is required.';
  end if;

  if p_decision is null or p_decision not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'Decision must be approve or reject.';
  end if;

  if note is not null and pg_catalog.length(note) > 2000 then
    raise exception using errcode = '22023', message = 'Review note must be 2000 characters or fewer.';
  end if;

  select * into proposal
  from public.change_proposals as queued
  where queued.id = p_proposal_id
  for update;

  if not found or proposal.status <> 'pending'::public.proposal_status then
    raise exception using errcode = 'P0002', message = 'Pending proposal not found.';
  end if;

  if p_decision = 'approve' then
    if proposal.operation = 'edit'::public.proposal_operation then
      select * into old_entry
      from public.glossary_entries as entry
      where entry.id = proposal.entry_id
      for update;

      if not found then
        raise exception using errcode = 'P0002', message = 'The glossary entry no longer exists.';
      end if;

      before_data := jsonb_build_object(
        'term', old_entry.term,
        'translation_es', old_entry.translation_es,
        'definition_en', old_entry.definition_en,
        'example_en', old_entry.example_en,
        'category', old_entry.category,
        'source_reference', old_entry.source_reference
      );
      after_data := proposal.proposed_data;

      update public.glossary_entries as entry
      set term = proposal.proposed_data ->> 'term',
          translation_es = proposal.proposed_data ->> 'translation_es',
          definition_en = proposal.proposed_data ->> 'definition_en',
          example_en = nullif(proposal.proposed_data ->> 'example_en', ''),
          category = proposal.proposed_data ->> 'category',
          source_reference = nullif(proposal.proposed_data ->> 'source_reference', ''),
          updated_by = reviewer_id
      where entry.id = proposal.entry_id;

      new_entry_id := proposal.entry_id;
    else
      -- Serialize create approvals so each receives a distinct max(sort_order) + 1.
      lock table public.glossary_entries in exclusive mode;
      select coalesce(max(entry.sort_order), 0) + 1 into next_sort_order
      from public.glossary_entries as entry;

      insert into public.glossary_entries (
        term, translation_es, definition_en, example_en, category,
        source_reference, sort_order, created_by, updated_by
      ) values (
        proposal.proposed_data ->> 'term',
        proposal.proposed_data ->> 'translation_es',
        proposal.proposed_data ->> 'definition_en',
        nullif(proposal.proposed_data ->> 'example_en', ''),
        proposal.proposed_data ->> 'category',
        nullif(proposal.proposed_data ->> 'source_reference', ''),
        next_sort_order,
        reviewer_id,
        reviewer_id
      ) returning id into new_entry_id;

      before_data := null;
      after_data := proposal.proposed_data;
    end if;

    insert into public.entry_revisions (
      entry_id, proposal_id, action, before_data, after_data, proposed_by, approved_by
    ) values (
      new_entry_id, proposal.id, proposal.operation, before_data, after_data,
      proposal.submitted_by, reviewer_id
    );

    update public.change_proposals as queued
    set status = 'approved'::public.proposal_status,
        reviewed_by = reviewer_id,
        reviewed_at = now(),
        review_note = note,
        reviewed_data = before_data
    where queued.id = proposal.id;
  else
    if proposal.operation = 'edit'::public.proposal_operation then
      select * into old_entry
      from public.glossary_entries as entry
      where entry.id = proposal.entry_id
      for update;

      if not found then
        raise exception using errcode = 'P0002', message = 'The glossary entry no longer exists.';
      end if;

      before_data := jsonb_build_object(
        'term', old_entry.term,
        'translation_es', old_entry.translation_es,
        'definition_en', old_entry.definition_en,
        'example_en', old_entry.example_en,
        'category', old_entry.category,
        'source_reference', old_entry.source_reference
      );
    end if;

    update public.change_proposals as queued
    set status = 'rejected'::public.proposal_status,
        reviewed_by = reviewer_id,
        reviewed_at = now(),
        review_note = note,
        reviewed_data = before_data
    where queued.id = proposal.id;
  end if;
end;
$$;

revoke all on function public.list_pending_glossary_proposals()
  from public, anon, service_role;
grant execute on function public.list_pending_glossary_proposals() to authenticated;

revoke all on function public.review_glossary_proposal(uuid, text, text)
  from public, anon, service_role;
grant execute on function public.review_glossary_proposal(uuid, text, text) to authenticated;

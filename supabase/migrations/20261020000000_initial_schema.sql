-- Initial data model for the collaborative glossary.
-- Access is closed by default; RLS policies and API grants are introduced in T1.2.

create type public.app_role as enum ('superadmin', 'teacher', 'student');
create type public.account_status as enum ('active', 'disabled');
create type public.proposal_operation as enum ('create', 'edit');
create type public.proposal_status as enum ('pending', 'approved', 'rejected');

create or replace function public.normalize_glossary_term(input_term text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lower(btrim(regexp_replace(input_term, '\s+', ' ', 'g')));
$$;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete restrict,
  display_name text not null check (length(btrim(display_name)) > 0),
  role public.app_role not null,
  status public.account_status not null default 'active',
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (user_id) on delete set null
);

create index profiles_role_status_idx on public.profiles (role, status);

create table public.glossary_entries (
  id uuid primary key default gen_random_uuid(),
  term text not null check (length(btrim(term)) > 0),
  normalized_term text generated always as (public.normalize_glossary_term(term)) stored,
  translation_es text not null check (length(btrim(translation_es)) > 0),
  definition_en text not null check (length(btrim(definition_en)) > 0),
  example_en text check (example_en is null or length(btrim(example_en)) > 0),
  category text not null check (length(btrim(category)) > 0),
  source_reference text check (source_reference is null or length(btrim(source_reference)) > 0),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (user_id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (user_id) on delete set null,
  constraint glossary_entries_normalized_term_nonempty check (length(normalized_term) > 0),
  constraint glossary_entries_normalized_term_key unique (normalized_term)
);

create index glossary_entries_category_idx on public.glossary_entries (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger glossary_entries_set_updated_at
before update on public.glossary_entries
for each row execute function public.set_updated_at();

create table public.change_proposals (
  id uuid primary key default gen_random_uuid(),
  operation public.proposal_operation not null,
  entry_id uuid references public.glossary_entries (id) on delete restrict,
  proposed_data jsonb not null,
  proposed_normalized_term text generated always as (
    public.normalize_glossary_term(proposed_data ->> 'term')
  ) stored,
  status public.proposal_status not null default 'pending',
  submitted_by uuid not null references public.profiles (user_id) on delete restrict,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (user_id) on delete restrict,
  reviewed_at timestamptz,
  review_note text,
  constraint change_proposals_operation_entry_check check (
    (operation = 'create' and entry_id is null)
    or (operation = 'edit' and entry_id is not null)
  ),
  constraint change_proposals_content_check check (
    jsonb_typeof(proposed_data) = 'object'
    and coalesce(jsonb_typeof(proposed_data -> 'term') = 'string', false)
    and coalesce(length(btrim(proposed_data ->> 'term')) > 0, false)
    and coalesce(jsonb_typeof(proposed_data -> 'translation_es') = 'string', false)
    and coalesce(length(btrim(proposed_data ->> 'translation_es')) > 0, false)
    and coalesce(jsonb_typeof(proposed_data -> 'definition_en') = 'string', false)
    and coalesce(length(btrim(proposed_data ->> 'definition_en')) > 0, false)
    and coalesce(jsonb_typeof(proposed_data -> 'category') = 'string', false)
    and coalesce(length(btrim(proposed_data ->> 'category')) > 0, false)
    and (not (proposed_data ? 'example_en')
      or proposed_data -> 'example_en' = 'null'::jsonb
      or (jsonb_typeof(proposed_data -> 'example_en') = 'string'
        and length(btrim(proposed_data ->> 'example_en')) > 0))
    and (not (proposed_data ? 'source_reference')
      or proposed_data -> 'source_reference' = 'null'::jsonb
      or (jsonb_typeof(proposed_data -> 'source_reference') = 'string'
        and length(btrim(proposed_data ->> 'source_reference')) > 0))
  ),
  constraint change_proposals_normalized_term_nonempty check (
    length(proposed_normalized_term) > 0
  ),
  constraint change_proposals_review_state_check check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null)
  ),
  constraint change_proposals_review_note_check check (
    review_note is null or length(btrim(review_note)) > 0
  )
);

create index change_proposals_submitter_status_idx
  on public.change_proposals (submitted_by, status, submitted_at desc);
create index change_proposals_review_queue_idx
  on public.change_proposals (submitted_at)
  where status = 'pending';
create unique index change_proposals_one_pending_edit_per_entry_idx
  on public.change_proposals (entry_id)
  where operation = 'edit' and status = 'pending';
create unique index change_proposals_one_pending_create_per_term_idx
  on public.change_proposals (proposed_normalized_term)
  where operation = 'create' and status = 'pending';

create table public.entry_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.glossary_entries (id) on delete restrict,
  proposal_id uuid not null unique references public.change_proposals (id) on delete restrict,
  action public.proposal_operation not null,
  before_data jsonb,
  after_data jsonb not null,
  proposed_by uuid not null references public.profiles (user_id) on delete restrict,
  approved_by uuid not null references public.profiles (user_id) on delete restrict,
  approved_at timestamptz not null default now(),
  constraint entry_revisions_data_check check (
    jsonb_typeof(after_data) = 'object'
    and (before_data is null or jsonb_typeof(before_data) = 'object')
    and ((action = 'create' and before_data is null)
      or (action = 'edit' and before_data is not null))
  )
);

create index entry_revisions_entry_approved_at_idx
  on public.entry_revisions (entry_id, approved_at desc);

alter table public.profiles enable row level security;
alter table public.glossary_entries enable row level security;
alter table public.change_proposals enable row level security;
alter table public.entry_revisions enable row level security;

revoke all privileges on table
  public.profiles,
  public.glossary_entries,
  public.change_proposals,
  public.entry_revisions
from public, anon, authenticated;

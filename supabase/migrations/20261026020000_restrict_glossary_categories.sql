-- Keep public entries and student proposals within the two supported categories.

alter table public.glossary_entries
  add constraint glossary_entries_category_allowed
  check (category in ('Threat', 'Security tool'));

alter table public.change_proposals
  add constraint change_proposals_category_allowed
  check (coalesce(proposed_data ->> 'category' in ('Threat', 'Security tool'), false));

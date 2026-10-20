-- T1.3: preserve the existing A-Z glossary grouping and display order.
-- New approved entries should receive max(sort_order) + 1 in the atomic T3.2 operation.

alter table public.glossary_entries
  add column sort_order integer;

with ranked_entries as (
  select
    id,
    row_number() over (
      order by
        case category when 'Threat' then 0 when 'Security tool' then 1 else 2 end,
        normalized_term,
        id
    )::integer as position
  from public.glossary_entries
)
update public.glossary_entries as entry
set sort_order = ranked_entries.position
from ranked_entries
where entry.id = ranked_entries.id;

alter table public.glossary_entries
  alter column sort_order set not null,
  add constraint glossary_entries_sort_order_positive check (sort_order > 0),
  add constraint glossary_entries_sort_order_key unique (sort_order);

comment on column public.glossary_entries.sort_order is
  'Stable display position. Seeded from the original HTML order; new approved entries append at max(sort_order) + 1.';

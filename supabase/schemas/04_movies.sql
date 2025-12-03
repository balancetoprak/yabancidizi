create table public.movies (
  id bigint generated always as identity primary key,
  category text not null unique,
  tmdb_ids bigint[] not null
);

alter table public.movies enable row level security;

create policy "everyone can read"
on public.movies
for select
to anon, authenticated
using (true);

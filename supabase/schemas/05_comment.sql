create table public.comments (
  id uuid default gen_random_uuid() primary key,
  movie_id bigint not null,               -- TMDB ID
  author uuid not null references auth.users(id) on delete cascade,
  content text not null,
  pinned boolean default false,
  created_at timestamp with time zone default now()
);

-- Performans için index
create index comments_movie_id_idx on public.comments (movie_id);

alter table public.comments enable row level security;

-- herkes yorumları okuyabilir
create policy "everyone can read comments"
on public.comments
for select
to anon, authenticated
using (true);

-- giriş yapan herkes yorum ekleyebilir
create policy "authenticated can insert comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = author);

-- sadece kendi yorumunu düzenleyebilir/silebilir
create policy "owners can update/delete their own comments"
on public.comments
for update, delete
to authenticated
using (auth.uid() = author);

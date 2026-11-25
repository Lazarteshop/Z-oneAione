-- AI Video Shop: wallets, catalog, GCash receipts, feed, views, payouts.

create table if not exists profiles (
  user_id text primary key references "user" ("id") on delete cascade,
  username text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  wallet_tokens integer not null default 0 check (wallet_tokens >= 0),
  gcash_number text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

create unique index if not exists profiles_one_admin_idx
  on profiles (role) where role = 'admin';

create table if not exists shop_assets (
  id text primary key,
  tier text not null unique check (tier in ('starter', 'pro', 'vip')),
  title text not null,
  description text not null,
  price_php integer not null check (price_php > 0),
  tokens_per_view integer not null check (tokens_per_view > 0),
  duration_sec integer not null default 16
);

create table if not exists purchases (
  id serial primary key,
  user_id text not null references profiles (user_id) on delete cascade,
  asset_id text not null references shop_assets (id),
  price_php integer not null,
  reference_number text not null unique,
  sender_gcash text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists purchases_user_idx on purchases (user_id, created_at desc);
create index if not exists purchases_status_idx on purchases (status, created_at);

create table if not exists feed_posts (
  id serial primary key,
  owner_id text not null references profiles (user_id) on delete cascade,
  purchase_id integer unique references purchases (id) on delete cascade,
  asset_id text not null references shop_assets (id),
  title text not null,
  tier text not null check (tier in ('starter', 'pro', 'vip')),
  tokens_per_view integer not null,
  view_count integer not null default 0,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists feed_posts_created_idx on feed_posts (created_at desc);

create table if not exists post_likes (
  post_id integer not null references feed_posts (id) on delete cascade,
  user_id text not null references profiles (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists video_views (
  id serial primary key,
  post_id integer not null references feed_posts (id) on delete cascade,
  viewer_id text not null references profiles (user_id) on delete cascade,
  viewer_ip text,
  watch_seconds integer not null,
  tokens_awarded integer not null,
  created_at timestamptz not null default now()
);

create index if not exists video_views_viewer_idx
  on video_views (post_id, viewer_id, created_at desc);

create index if not exists video_views_ip_idx
  on video_views (post_id, viewer_ip, created_at desc);

create table if not exists watch_sessions (
  id serial primary key,
  post_id integer not null references feed_posts (id) on delete cascade,
  user_id text not null references profiles (user_id) on delete cascade,
  ip text,
  started_at timestamptz not null default now(),
  claimed boolean not null default false
);

create index if not exists watch_sessions_user_idx
  on watch_sessions (user_id, post_id, claimed);

create table if not exists withdrawals (
  id serial primary key,
  user_id text not null references profiles (user_id) on delete cascade,
  tokens integer not null check (tokens >= 1000 and tokens % 1000 = 0),
  amount_php integer not null check (amount_php >= 100),
  gcash_number text not null,
  script text not null,
  status text not null default 'queued' check (status in ('queued', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists withdrawals_status_idx on withdrawals (status, created_at);

create table if not exists wallet_ledger (
  id serial primary key,
  user_id text not null references profiles (user_id) on delete cascade,
  delta integer not null,
  reason text not null,
  ref_id text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_ledger_user_idx on wallet_ledger (user_id, created_at desc);

insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
values ('studio-ledger', 'Ledger Studio', 'studio@aive.invalid', true, now(), now())
on conflict ("id") do nothing;

insert into profiles (user_id, username, role, wallet_tokens)
values ('studio-ledger', 'Ledger Studio', 'user', 0)
on conflict (user_id) do nothing;

insert into shop_assets (id, tier, title, description, price_php, tokens_per_view, duration_sec)
values
  ('starter', 'starter', 'Starter AI Video', 'A dusk alley loop. Each valid view pays 2 AI Tokens.', 150, 2, 16),
  ('pro', 'pro', 'Pro AI Video', 'A harbor signal film. Each valid view pays 4 AI Tokens.', 300, 4, 16),
  ('vip', 'vip', 'VIP AI Video', 'A goldroom afterimage. Each valid view pays 5 AI Tokens.', 500, 5, 16)
on conflict (id) do nothing;

insert into feed_posts (owner_id, asset_id, title, tier, tokens_per_view)
select 'studio-ledger', 'starter', 'Neon rain alley, dawn loop', 'starter', 2
where not exists (
  select 1 from feed_posts
  where owner_id = 'studio-ledger' and asset_id = 'starter' and purchase_id is null
);

insert into feed_posts (owner_id, asset_id, title, tier, tokens_per_view)
select 'studio-ledger', 'pro', 'Harbor signals, cut 04', 'pro', 4
where not exists (
  select 1 from feed_posts
  where owner_id = 'studio-ledger' and asset_id = 'pro' and purchase_id is null
);

insert into feed_posts (owner_id, asset_id, title, tier, tokens_per_view)
select 'studio-ledger', 'vip', 'Goldroom afterimage', 'vip', 5
where not exists (
  select 1 from feed_posts
  where owner_id = 'studio-ledger' and asset_id = 'vip' and purchase_id is null
);

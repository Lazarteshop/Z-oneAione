-- Gallery uploads are one-of-a-kind. A pending or approved receipt takes the film off the shelf.
alter table shop_assets add column if not exists exclusive boolean not null default false;

create table if not exists shop_videos (
  asset_id text primary key references shop_assets (id) on delete cascade,
  mime text not null,
  bytes bytea not null
);

-- Admin can stock more than one film per look, and pull a film off the shelf.
alter table shop_assets drop constraint if exists shop_assets_tier_key;
alter table shop_assets add column if not exists listed boolean not null default true;

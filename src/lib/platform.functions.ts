import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { TierId } from "@/lib/catalog";
import { MIN_WITHDRAW_TOKENS } from "@/lib/catalog";
import { getSql, type Sql } from "@/lib/db";
import { normalizeGcash, normalizeRef, payoutScript } from "@/lib/format";

export type Me = {
  userId: string;
  username: string;
  email: string;
  role: "user" | "admin";
  walletTokens: number;
  gcashNumber: string | null;
  adminQueue: number | null;
};

export type FeedPost = {
  id: number;
  ownerId: string;
  username: string;
  title: string;
  tier: TierId;
  tokensPerView: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  liked: boolean;
  counted: boolean;
  assetId: string;
  hasVideo: boolean;
};

export type ShopAsset = {
  id: string;
  tier: TierId;
  title: string;
  description: string;
  pricePhp: number;
  tokensPerView: number;
  hasVideo: boolean;
  soldOut: boolean;
};

export type Purchase = {
  id: number;
  assetId: string;
  tier: TierId;
  title: string;
  pricePhp: number;
  reference: string;
  senderGcash: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type LedgerRow = {
  id: number;
  delta: number;
  reason: string;
  createdAt: string;
};

export type Withdrawal = {
  id: number;
  tokens: number;
  amountPhp: number;
  gcashNumber: string;
  script: string;
  status: "queued" | "paid" | "rejected";
  createdAt: string;
  username?: string;
  email?: string;
};

export type StartWatch =
  | { eligible: true; sessionId: number }
  | { eligible: false; reason: "self" | "user_24h" | "ip_24h" | "missing" };

export type ClaimResult =
  | { ok: true; tokens: number; viewCount: number }
  | { ok: false; reason: "too_soon" | "self" | "user_24h" | "ip_24h" | "missing" | "already" };

type ProfileRow = {
  user_id: string;
  username: string;
  role: string;
  wallet_tokens: number | string;
  gcash_number: string | null;
  email: string;
};

function asObject(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") throw new Error("Invalid request.");
  return data as Record<string, unknown>;
}

function intId(value: unknown, label: string): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${label}.`);
  return n;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function flag(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function stamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

function asTier(value: unknown): TierId {
  return value === "pro" || value === "vip" ? value : "starter";
}

function assetIdOf(value: unknown): string {
  const id = String(value ?? "");
  return /^[a-z0-9_-]{1,40}$/.test(id) ? id : "";
}

function stripControlChars(str: string): string {
  return [...str].filter((ch) => ch.charCodeAt(0) >= 0x20).join("");
}

function cleanText(value: unknown, max: number): string {
  return stripControlChars(String(value ?? ""))
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
}

function asRole(value: unknown): "user" | "admin" {
  return value === "admin" ? "admin" : "user";
}

function asPurchaseStatus(value: unknown): Purchase["status"] {
  if (value === "approved" || value === "rejected") return value;
  return "pending";
}

function asWithdrawalStatus(value: unknown): Withdrawal["status"] {
  if (value === "paid" || value === "rejected") return value;
  return "queued";
}

function isUniqueViolation(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    if ((err as { code?: string }).code === "23505") return true;
    if (isUniqueViolation((err as { cause?: unknown }).cause)) return true;
  }
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /duplicate key|unique constraint|23505/i.test(msg);
}

async function readIpHash(): Promise<string | null> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const raw = fwd || req.headers.get("x-real-ip") || "";
    if (!raw) return null;
    const { createHash } = await import("node:crypto");
    return createHash("sha256").update(raw).digest("hex").slice(0, 24);
  } catch {
    return null;
  }
}

async function loadProfile(sql: Sql, userId: string): Promise<ProfileRow | null> {
  const rows = await sql<ProfileRow>`
    select p.user_id, p.username, p.role, p.wallet_tokens, p.gcash_number, u.email
    from profiles p
    join "user" u on u.id = p.user_id
    where p.user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function freeName(sql: Sql, base: string): Promise<string> {
  const root = base.trim().slice(0, 24) || "Member";
  for (let i = 0; i < 8; i += 1) {
    const candidate = i === 0 ? root : `${root.slice(0, 20)} ${i + 1}`;
    const hit = await sql<{ n: number }>`
      select count(*)::int as n from profiles where lower(username) = lower(${candidate})
    `;
    if (num(hit[0]?.n) === 0) return candidate;
  }
  return `${root.slice(0, 16)} ${Math.floor(Math.random() * 900 + 100)}`;
}

async function ensureProfile(sql: Sql, userId: string): Promise<ProfileRow> {
  const existing = await loadProfile(sql, userId);
  if (existing) return existing;

  const users = await sql<{ name: string; email: string }>`
    select name, email from "user" where id = ${userId}
  `;
  const user = users[0];
  if (!user) throw new Error("Account not found.");
  const base =
    stripControlChars(user.name || user.email.split("@")[0] || "Member")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 24) || "Member";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = await freeName(sql, attempt === 0 ? base : `${base.slice(0, 18)} ${attempt + 1}`);
    try {
      await sql`
        insert into profiles (user_id, username, role)
        values (${userId}, ${username}, 'user')
        on conflict (user_id) do nothing
      `;
      break;
    } catch (err) {
      if (!isUniqueViolation(err) || attempt === 4) throw err;
    }
  }

  const created = await loadProfile(sql, userId);
  if (!created) throw new Error("Could not open your wallet.");
  return created;
}

function toMe(row: ProfileRow, adminQueue: number | null): Me {
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    role: asRole(row.role),
    walletTokens: num(row.wallet_tokens),
    gcashNumber: row.gcash_number,
    adminQueue,
  };
}

async function requireAdmin(sql: Sql, userId: string): Promise<ProfileRow> {
  const profile = await ensureProfile(sql, userId);
  if (profile.role !== "admin") throw new Error("Admin only.");
  return profile;
}

export const adminDeskStatus = createServerFn({ method: "GET" }).handler(async (): Promise<{ open: boolean }> => {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from profiles where role = 'admin'`;
  return { open: num(rows[0]?.n) > 0 };
});

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ok: boolean }> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const existing = await loadProfile(sql, context.userId);
    if (existing?.role === "admin") return { ok: true };
    const rows = await sql<{ user_id: string }>`
      update profiles
      set role = 'admin'
      where user_id = ${context.userId}
        and role = 'user'
        and not exists (select 1 from profiles where role = 'admin')
      returning user_id
    `;
    return { ok: Boolean(rows[0]) };
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Me> => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    if (profile.role !== "admin") return toMe(profile, null);
    const rows = await sql<{ n: number }>`
      select (
        (select count(*)::int from purchases where status = 'pending')
        + (select count(*)::int from withdrawals where status = 'queued')
      ) as n
    `;
    return toMe(profile, num(rows[0]?.n));
  });

export const getFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FeedPost[]> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const rows = await sql<{
      id: number;
      owner_id: string;
      username: string;
      title: string;
      tier: string;
      tokens_per_view: number;
      view_count: number;
      like_count: number;
      created_at: unknown;
      liked: unknown;
      counted: unknown;
      asset_id: string;
      has_video: unknown;
    }>`
      select
        f.id,
        f.owner_id,
        pr.username,
        f.title,
        f.tier,
        f.tokens_per_view,
        f.view_count,
        f.like_count,
        f.created_at,
        f.asset_id,
        exists(
          select 1 from post_likes l
          where l.post_id = f.id and l.user_id = ${context.userId}
        ) as liked,
        exists(
          select 1 from video_views v
          where v.post_id = f.id
            and v.viewer_id = ${context.userId}
            and v.created_at > now() - interval '24 hours'
        ) as counted,
        exists(select 1 from shop_videos sv where sv.asset_id = f.asset_id) as has_video
      from feed_posts f
      join profiles pr on pr.user_id = f.owner_id
      order by f.created_at desc, f.id desc
      limit 50
    `;
    return rows.map((row) => ({
      id: num(row.id),
      ownerId: row.owner_id,
      username: row.username,
      title: row.title,
      tier: asTier(row.tier),
      tokensPerView: num(row.tokens_per_view),
      viewCount: num(row.view_count),
      likeCount: num(row.like_count),
      createdAt: stamp(row.created_at),
      liked: flag(row.liked),
      counted: flag(row.counted),
      assetId: row.asset_id,
      hasVideo: flag(row.has_video),
    }));
  });

export const getShop = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ assets: ShopAsset[]; purchases: Purchase[] }> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const assets = await sql<{
      id: string;
      tier: string;
      title: string;
      description: string;
      price_php: number;
      tokens_per_view: number;
      has_video: unknown;
      sold_out: unknown;
    }>`
      select
        id,
        tier,
        title,
        description,
        price_php,
        tokens_per_view,
        exists(select 1 from shop_videos v where v.asset_id = shop_assets.id) as has_video,
        (
          exclusive
          and exists (
            select 1 from purchases p
            where p.asset_id = shop_assets.id and p.status in ('pending', 'approved')
          )
        ) as sold_out
      from shop_assets
      where listed = true
      order by price_php asc, id asc
    `;
    const purchases = await sql<{
      id: number;
      asset_id: string;
      tier: string;
      title: string;
      price_php: number;
      reference_number: string;
      sender_gcash: string;
      status: string;
      created_at: unknown;
    }>`
      select p.id, p.asset_id, a.tier, a.title, p.price_php, p.reference_number,
             p.sender_gcash, p.status, p.created_at
      from purchases p
      join shop_assets a on a.id = p.asset_id
      where p.user_id = ${context.userId}
      order by p.created_at desc
      limit 20
    `;
    return {
      assets: assets.map((row) => ({
        id: row.id,
        tier: asTier(row.tier),
        title: row.title,
        description: row.description,
        pricePhp: num(row.price_php),
        tokensPerView: num(row.tokens_per_view),
        hasVideo: flag(row.has_video),
        soldOut: flag(row.sold_out),
      })),
      purchases: purchases.map((row) => ({
        id: num(row.id),
        assetId: row.asset_id,
        tier: asTier(row.tier),
        title: row.title,
        pricePhp: num(row.price_php),
        reference: row.reference_number,
        senderGcash: row.sender_gcash,
        status: asPurchaseStatus(row.status),
        createdAt: stamp(row.created_at),
      })),
    };
  });

export const submitPurchase = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ id: number }> => {
    const body = asObject(data);
    const assetId = assetIdOf(body.assetId);
    if (!assetId) throw new Error("Unknown film.");
    const reference = normalizeRef(String(body.reference ?? ""));
    if (!reference) throw new Error("Enter the GCash reference: 6 to 32 letters or numbers.");
    const sender = normalizeGcash(String(body.senderGcash ?? ""));
    if (!sender) throw new Error("Enter the sender's GCash mobile, like 09171234567.");

    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const assets = await sql<{ price_php: number }>`
      select price_php from shop_assets where id = ${assetId} and listed = true
    `;
    if (!num(assets[0]?.price_php)) throw new Error("That film is not in the shop.");

    try {
      const rows = await sql<{ id: number }>`
        with lk as (
          select pg_advisory_xact_lock(hashtext(${`buy:${assetId}`})) as locked
        ),
        asset as (
          select s.id, s.price_php, s.exclusive
          from shop_assets s, lk
          where s.id = ${assetId} and s.listed = true
        ),
        ins as (
          insert into purchases (user_id, asset_id, price_php, reference_number, sender_gcash)
          select ${context.userId}, a.id, a.price_php, ${reference}, ${sender}
          from asset a
          where a.exclusive = false
            or not exists (
              select 1 from purchases p
              where p.asset_id = a.id and p.status in ('pending', 'approved')
            )
          returning id
        )
        select id from ins
      `;
      const id = rows[0]?.id;
      if (!id) throw new Error("This film is sold out.");
      return { id: num(id) };
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new Error("That GCash reference was already submitted.");
      }
      throw err;
    }
  });

export const saveGcash = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ gcashNumber: string }> => {
    const body = asObject(data);
    const gcash = normalizeGcash(String(body.gcashNumber ?? ""));
    if (!gcash) throw new Error("Enter a Philippine mobile number, like 09171234567.");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    await sql`
      update profiles set gcash_number = ${gcash} where user_id = ${context.userId}
    `;
    return { gcashNumber: gcash };
  });

export const getWallet = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ me: Me; ledger: LedgerRow[]; withdrawals: Withdrawal[] }> => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const ledger = await sql<{ id: number; delta: number; reason: string; created_at: unknown }>`
      select id, delta, reason, created_at
      from wallet_ledger
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
    const withdrawals = await sql<{
      id: number;
      tokens: number;
      amount_php: number;
      gcash_number: string;
      script: string;
      status: string;
      created_at: unknown;
    }>`
      select id, tokens, amount_php, gcash_number, script, status, created_at
      from withdrawals
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
    return {
      me: toMe(profile, null),
      ledger: ledger.map((row) => ({
        id: num(row.id),
        delta: num(row.delta),
        reason: row.reason,
        createdAt: stamp(row.created_at),
      })),
      withdrawals: withdrawals.map((row) => ({
        id: num(row.id),
        tokens: num(row.tokens),
        amountPhp: num(row.amount_php),
        gcashNumber: row.gcash_number,
        script: row.script,
        status: asWithdrawalStatus(row.status),
        createdAt: stamp(row.created_at),
      })),
    };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ balance: number; withdrawal: Withdrawal }> => {
    const body = asObject(data);
    const tokens = num(body.tokens);
    if (!Number.isInteger(tokens) || tokens < MIN_WITHDRAW_TOKENS || tokens % MIN_WITHDRAW_TOKENS !== 0) {
      throw new Error("Payouts start at 1,000 tokens and move in steps of 1,000.");
    }
    const gcash = normalizeGcash(String(body.gcashNumber ?? ""));
    if (!gcash) throw new Error("Enter the GCash number that should receive the pesos.");

    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const amountPhp = tokens / 10;
    const script = payoutScript(profile.username, amountPhp, gcash);

    const rows = await sql<{
      wallet_tokens: number | null;
      username: string | null;
      id: number | null;
      tokens: number | null;
      amount_php: number | null;
      gcash_number: string | null;
      script: string | null;
    }>`
      with upd as (
        update profiles
        set wallet_tokens = wallet_tokens - ${tokens},
            gcash_number = ${gcash}
        where user_id = ${context.userId}
          and wallet_tokens >= ${tokens}
        returning user_id, username, wallet_tokens, gcash_number
      ),
      ins as (
        insert into withdrawals (user_id, tokens, amount_php, gcash_number, script)
        select user_id, ${tokens}, ${amountPhp}, gcash_number, ${script}
        from upd
        returning id, tokens, amount_php, gcash_number, script
      ),
      led as (
        insert into wallet_ledger (user_id, delta, reason, ref_id)
        select u.user_id, ${-tokens}, 'withdrawal', i.id::text
        from upd u
        join ins i on true
        returning id
      )
      select
        (select wallet_tokens from upd) as wallet_tokens,
        (select username from upd) as username,
        (select id from ins) as id,
        (select tokens from ins) as tokens,
        (select amount_php from ins) as amount_php,
        (select gcash_number from ins) as gcash_number,
        (select script from ins) as script,
        (select count(*)::int from led) as led_n
    `;
    const row = rows[0];
    if (!row?.id || row.wallet_tokens == null) {
      throw new Error("Not enough tokens for that payout.");
    }
    return {
      balance: num(row.wallet_tokens),
      withdrawal: {
        id: num(row.id),
        tokens: num(row.tokens),
        amountPhp: num(row.amount_php),
        gcashNumber: row.gcash_number ?? gcash,
        script: row.script ?? script,
        status: "queued",
        createdAt: new Date().toISOString(),
        username: row.username ?? profile.username,
      },
    };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ liked: boolean; likeCount: number }> => {
    const postId = intId(asObject(data).postId, "film");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const posts = await sql<{ id: number }>`select id from feed_posts where id = ${postId}`;
    if (!posts[0]) throw new Error("That film is gone.");
    const existing = await sql`select 1 as ok from post_likes where post_id = ${postId} and user_id = ${context.userId}`;
    if (existing.length > 0) {
      await sql`delete from post_likes where post_id = ${postId} and user_id = ${context.userId}`;
      const rows = await sql<{ like_count: number }>`
        update feed_posts
        set like_count = greatest(0, like_count - 1)
        where id = ${postId}
        returning like_count
      `;
      return { liked: false, likeCount: num(rows[0]?.like_count) };
    }
    await sql`insert into post_likes (post_id, user_id) values (${postId}, ${context.userId})`;
    const rows = await sql<{ like_count: number }>`
      update feed_posts set like_count = like_count + 1 where id = ${postId} returning like_count
    `;
    return { liked: true, likeCount: num(rows[0]?.like_count) };
  });

export const startWatch = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<StartWatch> => {
    const postId = intId(asObject(data).postId, "film");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const posts = await sql<{ owner_id: string }>`select owner_id from feed_posts where id = ${postId}`;
    const post = posts[0];
    if (!post) return { eligible: false, reason: "missing" };
    if (post.owner_id === context.userId) return { eligible: false, reason: "self" };

    const recentUser = await sql<{ n: number }>`
      select count(*)::int as n from video_views
      where post_id = ${postId}
        and viewer_id = ${context.userId}
        and created_at > now() - interval '24 hours'
    `;
    if (num(recentUser[0]?.n) > 0) return { eligible: false, reason: "user_24h" };

    const ip = await readIpHash();
    if (ip) {
      const recentIp = await sql<{ n: number }>`
        select count(*)::int as n from video_views
        where post_id = ${postId}
          and viewer_ip = ${ip}
          and created_at > now() - interval '24 hours'
      `;
      if (num(recentIp[0]?.n) > 0) return { eligible: false, reason: "ip_24h" };
    }

    await sql`
      delete from watch_sessions
      where user_id = ${context.userId} and post_id = ${postId} and claimed = false
    `;
    const inserted = await sql<{ id: number }>`
      insert into watch_sessions (post_id, user_id, ip)
      values (${postId}, ${context.userId}, ${ip})
      returning id
    `;
    const sessionId = inserted[0]?.id;
    if (!sessionId) return { eligible: false, reason: "missing" };
    return { eligible: true, sessionId: num(sessionId) };
  });

export const claimWatch = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<ClaimResult> => {
    const sessionId = intId(asObject(data).sessionId, "session");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const pre = await sql<{
      post_id: number;
      claimed: unknown;
      age: number | string;
      owner_id: string;
      recent_user: unknown;
      recent_ip: unknown;
    }>`
      select
        s.post_id,
        s.claimed,
        extract(epoch from (now() - s.started_at)) as age,
        f.owner_id,
        exists(
          select 1 from video_views v
          where v.post_id = s.post_id
            and v.viewer_id = s.user_id
            and v.created_at > now() - interval '24 hours'
        ) as recent_user,
        case
          when s.ip is null then false
          else exists(
            select 1 from video_views v
            where v.post_id = s.post_id
              and v.viewer_ip = s.ip
              and v.created_at > now() - interval '24 hours'
          )
        end as recent_ip
      from watch_sessions s
      join feed_posts f on f.id = s.post_id
      where s.id = ${sessionId} and s.user_id = ${context.userId}
    `;
    const row = pre[0];
    if (!row) return { ok: false, reason: "missing" };
    if (flag(row.claimed)) return { ok: false, reason: "already" };
    if (num(row.age) < 5) return { ok: false, reason: "too_soon" };
    if (row.owner_id === context.userId) return { ok: false, reason: "self" };
    if (flag(row.recent_user)) return { ok: false, reason: "user_24h" };
    if (flag(row.recent_ip)) return { ok: false, reason: "ip_24h" };

    const lockKey = `viewpost:${row.post_id}`;
    const awarded = await sql<{ tokens: number | null; view_count: number | null }>`
      with lk as (
        select pg_advisory_xact_lock(hashtext(${lockKey})) as locked
      ),
      sess as (
        select s.id, s.post_id, s.ip, s.started_at
        from watch_sessions s, lk
        where s.id = ${sessionId}
          and s.user_id = ${context.userId}
          and s.claimed = false
          and s.started_at <= now() - interval '5 seconds'
      ),
      post as (
        select f.id, f.owner_id, f.tokens_per_view
        from feed_posts f
        join sess s on s.post_id = f.id
        where f.owner_id <> ${context.userId}
      ),
      ins as (
        insert into video_views (post_id, viewer_id, viewer_ip, watch_seconds, tokens_awarded)
        select
          p.id,
          ${context.userId},
          s.ip,
          greatest(5, floor(extract(epoch from (now() - s.started_at)))::int),
          p.tokens_per_view
        from post p
        join sess s on true
        where not exists (
          select 1 from video_views v
          where v.post_id = p.id
            and v.viewer_id = ${context.userId}
            and v.created_at > now() - interval '24 hours'
        )
        and (
          s.ip is null
          or not exists (
            select 1 from video_views v
            where v.post_id = p.id
              and v.viewer_ip = s.ip
              and v.created_at > now() - interval '24 hours'
          )
        )
        returning post_id, tokens_awarded
      ),
      mark as (
        update watch_sessions w
        set claimed = true
        from ins i
        where w.id = ${sessionId}
        returning w.id
      ),
      bump as (
        update feed_posts f
        set view_count = f.view_count + 1
        from ins i
        where f.id = i.post_id
        returning f.owner_id, f.view_count, i.tokens_awarded
      ),
      pay as (
        update profiles pr
        set wallet_tokens = pr.wallet_tokens + b.tokens_awarded
        from bump b
        where pr.user_id = b.owner_id
        returning b.tokens_awarded, b.view_count, pr.user_id
      ),
      led as (
        insert into wallet_ledger (user_id, delta, reason, ref_id)
        select p.user_id, p.tokens_awarded, 'view', ${String(row.post_id)}
        from pay p
        returning id
      )
      select
        (select tokens_awarded from pay) as tokens,
        (select view_count from pay) as view_count,
        (select count(*)::int from mark) as marked,
        (select count(*)::int from led) as led_n
    `;
    const done = awarded[0];
    if (done?.tokens == null || done.view_count == null) return { ok: false, reason: "already" };
    return { ok: true, tokens: num(done.tokens), viewCount: num(done.view_count) };
  });

type AdminPurchase = Purchase & { username: string; email: string };

export const getAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ purchases: AdminPurchase[]; recent: AdminPurchase[]; payouts: Withdrawal[]; paid: Withdrawal[]; films: ShopAsset[] }> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const pendingRows = await sql<{
      id: number;
      asset_id: string;
      tier: string;
      title: string;
      price_php: number;
      reference_number: string;
      sender_gcash: string;
      status: string;
      created_at: unknown;
      username: string;
      email: string;
    }>`
      select p.id, p.asset_id, a.tier, a.title, p.price_php, p.reference_number,
             p.sender_gcash, p.status, p.created_at, pr.username, u.email
      from purchases p
      join shop_assets a on a.id = p.asset_id
      join profiles pr on pr.user_id = p.user_id
      join "user" u on u.id = p.user_id
      where p.status = 'pending'
      order by p.created_at asc
      limit 50
    `;
    const recentRows = await sql<{
      id: number;
      asset_id: string;
      tier: string;
      title: string;
      price_php: number;
      reference_number: string;
      sender_gcash: string;
      status: string;
      created_at: unknown;
      username: string;
      email: string;
    }>`
      select p.id, p.asset_id, a.tier, a.title, p.price_php, p.reference_number,
             p.sender_gcash, p.status, p.created_at, pr.username, u.email
      from purchases p
      join shop_assets a on a.id = p.asset_id
      join profiles pr on pr.user_id = p.user_id
      join "user" u on u.id = p.user_id
      where p.status <> 'pending'
      order by p.reviewed_at desc nulls last
      limit 8
    `;
    const mapPurchase = (row: (typeof pendingRows)[number]): AdminPurchase => ({
      id: num(row.id),
      assetId: row.asset_id,
      tier: asTier(row.tier),
      title: row.title,
      pricePhp: num(row.price_php),
      reference: row.reference_number,
      senderGcash: row.sender_gcash,
      status: asPurchaseStatus(row.status),
      createdAt: stamp(row.created_at),
      username: row.username,
      email: row.email,
    });

    const payoutRows = await sql<{
      id: number;
      tokens: number;
      amount_php: number;
      gcash_number: string;
      script: string;
      status: string;
      created_at: unknown;
      username: string;
      email: string;
    }>`
      select w.id, w.tokens, w.amount_php, w.gcash_number, w.script, w.status, w.created_at,
             pr.username, u.email
      from withdrawals w
      join profiles pr on pr.user_id = w.user_id
      join "user" u on u.id = w.user_id
      where w.status = 'queued'
      order by w.created_at asc
      limit 50
    `;
    const paidRows = await sql<{
      id: number;
      tokens: number;
      amount_php: number;
      gcash_number: string;
      script: string;
      status: string;
      created_at: unknown;
      username: string;
      email: string;
    }>`
      select w.id, w.tokens, w.amount_php, w.gcash_number, w.script, w.status, w.created_at,
             pr.username, u.email
      from withdrawals w
      join profiles pr on pr.user_id = w.user_id
      join "user" u on u.id = w.user_id
      where w.status <> 'queued'
      order by w.resolved_at desc nulls last
      limit 8
    `;
    const mapWithdrawal = (row: (typeof payoutRows)[number]): Withdrawal => ({
      id: num(row.id),
      tokens: num(row.tokens),
      amountPhp: num(row.amount_php),
      gcashNumber: row.gcash_number,
      script: row.script,
      status: asWithdrawalStatus(row.status),
      createdAt: stamp(row.created_at),
      username: row.username,
      email: row.email,
    });

    const filmRows = await sql<{
      id: string;
      tier: string;
      title: string;
      description: string;
      price_php: number;
      tokens_per_view: number;
      has_video: unknown;
      sold_out: unknown;
    }>`
      select
        id,
        tier,
        title,
        description,
        price_php,
        tokens_per_view,
        exists(select 1 from shop_videos v where v.asset_id = shop_assets.id) as has_video,
        (
          exclusive
          and exists (
            select 1 from purchases p
            where p.asset_id = shop_assets.id and p.status in ('pending', 'approved')
          )
        ) as sold_out
      from shop_assets
      where listed = true
      order by price_php asc, id asc
    `;

    return {
      purchases: pendingRows.map(mapPurchase),
      recent: recentRows.map(mapPurchase),
      payouts: payoutRows.map(mapWithdrawal),
      paid: paidRows.map(mapWithdrawal),
      films: filmRows.map((row) => ({
        id: row.id,
        tier: asTier(row.tier),
        title: row.title,
        description: row.description,
        pricePhp: num(row.price_php),
        tokensPerView: num(row.tokens_per_view),
        hasVideo: flag(row.has_video),
        soldOut: flag(row.sold_out),
      })),
    };
  });

export const addShopFilm = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<ShopAsset> => {
    const body = asObject(data);
    const title = cleanText(body.title, 80);
    const description = cleanText(body.description, 240);
    const tier = body.tier === "pro" || body.tier === "vip" || body.tier === "starter" ? body.tier : null;
    if (!tier) throw new Error("Choose a look: starter, pro, or vip.");
    if (title.length < 2) throw new Error("Give the film a title.");
    if (description.length < 2) throw new Error("Add a short description.");
    const pricePhp = intId(body.pricePhp, "price");
    const tokensPerView = intId(body.tokensPerView, "token rate");
    if (pricePhp > 100_000) throw new Error("Price is too high.");
    if (tokensPerView > 100) throw new Error("Token rate is too high.");

    const { randomBytes } = await import("node:crypto");
    const id = `f${randomBytes(6).toString("hex")}`;
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`
      insert into shop_assets (id, tier, title, description, price_php, tokens_per_view, duration_sec, listed)
      values (${id}, ${tier}, ${title}, ${description}, ${pricePhp}, ${tokensPerView}, 16, true)
    `;
    return { id, tier, title, description, pricePhp, tokensPerView, hasVideo: false, soldOut: false };
  });

export const deleteShopFilm = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ ok: true; kept: boolean }> => {
    const id = assetIdOf(asObject(data).assetId);
    if (!id) throw new Error("Unknown film.");
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const refs = await sql<{ n: number }>`
      select (
        (select count(*)::int from purchases where asset_id = ${id})
        + (select count(*)::int from feed_posts where asset_id = ${id})
      ) as n
    `;
    const kept = num(refs[0]?.n) > 0;
    if (kept) {
      const rows = await sql<{ id: string }>`
        update shop_assets set listed = false where id = ${id} returning id
      `;
      if (!rows[0]) throw new Error("That film is not in the shop.");
      return { ok: true, kept: true };
    }
    const rows = await sql<{ id: string }>`
      delete from shop_assets where id = ${id} returning id
    `;
    if (!rows[0]) throw new Error("That film is not in the shop.");
    return { ok: true, kept: false };
  });

export const reviewPurchase = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ ok: boolean }> => {
    const body = asObject(data);
    const purchaseId = intId(body.purchaseId, "receipt");
    const decision = body.decision === "approve" ? "approve" : body.decision === "reject" ? "reject" : null;
    if (!decision) throw new Error("Choose approve or reject.");
    const sql = await getSql();
    await requireAdmin(sql, context.userId);

    if (decision === "reject") {
      const rows = await sql<{ id: number }>`
        update purchases
        set status = 'rejected', reviewed_at = now()
        where id = ${purchaseId} and status = 'pending'
        returning id
      `;
      return { ok: Boolean(rows[0]) };
    }

    const rows = await sql<{ post_id: number | null }>`
      with approved as (
        update purchases
        set status = 'approved', reviewed_at = now()
        where id = ${purchaseId} and status = 'pending'
        returning id, user_id, asset_id
      ),
      posted as (
        insert into feed_posts (owner_id, purchase_id, asset_id, title, tier, tokens_per_view)
        select a.user_id, a.id, a.asset_id, s.title, s.tier, s.tokens_per_view
        from approved a
        join shop_assets s on s.id = a.asset_id
        returning id
      )
      select (select id from posted) as post_id
    `;
    return { ok: rows[0]?.post_id != null };
  });

export const reviewWithdrawal = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ ok: boolean }> => {
    const body = asObject(data);
    const withdrawalId = intId(body.withdrawalId, "payout");
    const decision = body.decision === "paid" ? "paid" : body.decision === "reject" ? "reject" : null;
    if (!decision) throw new Error("Choose paid or reject.");
    const sql = await getSql();
    await requireAdmin(sql, context.userId);

    if (decision === "paid") {
      const rows = await sql<{ id: number }>`
        update withdrawals
        set status = 'paid', resolved_at = now()
        where id = ${withdrawalId} and status = 'queued'
        returning id
      `;
      return { ok: Boolean(rows[0]) };
    }

    const rows = await sql<{ n: number }>`
      with upd as (
        update withdrawals
        set status = 'rejected', resolved_at = now()
        where id = ${withdrawalId} and status = 'queued'
        returning user_id, tokens
      ),
      pay as (
        update profiles p
        set wallet_tokens = p.wallet_tokens + u.tokens
        from upd u
        where p.user_id = u.user_id
        returning p.user_id
      ),
      led as (
        insert into wallet_ledger (user_id, delta, reason, ref_id)
        select u.user_id, u.tokens, 'withdrawal_refund', ${String(withdrawalId)}
        from upd u
        returning id
      )
      select (select count(*)::int from upd) as n, (select count(*)::int from pay) as paid_n,
             (select count(*)::int from led) as led_n
    `;
    return { ok: num(rows[0]?.n) > 0 };
  });

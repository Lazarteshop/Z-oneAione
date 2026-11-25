import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as normalizeGcash, n as authMiddleware, o as normalizeRef, s as payoutScript } from "./format-CJdfWsUb.mjs";
import { r as getSql } from "./db-B1ReFq20.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform.functions-1xFVpo25.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asObject(data) {
	if (!data || typeof data !== "object") throw new Error("Invalid request.");
	return data;
}
function intId(value, label) {
	const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
	if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${label}.`);
	return n;
}
function num(value) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : 0;
}
function flag(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function stamp(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string" && value) {
		const d = new Date(value);
		if (!Number.isNaN(d.getTime())) return d.toISOString();
	}
	return (/* @__PURE__ */ new Date()).toISOString();
}
function asTier(value) {
	return value === "pro" || value === "vip" ? value : "starter";
}
function asRole(value) {
	return value === "admin" ? "admin" : "user";
}
function asPurchaseStatus(value) {
	if (value === "approved" || value === "rejected") return value;
	return "pending";
}
function asWithdrawalStatus(value) {
	if (value === "paid" || value === "rejected") return value;
	return "queued";
}
function isUniqueViolation(err) {
	if (typeof err === "object" && err !== null) {
		if (err.code === "23505") return true;
		if (isUniqueViolation(err.cause)) return true;
	}
	const msg = err instanceof Error ? err.message : String(err ?? "");
	return /duplicate key|unique constraint|23505/i.test(msg);
}
async function readIpHash() {
	try {
		const { getRequest } = await import("./ssr.mjs").then((n) => n.c).then((n) => n.t);
		const req = getRequest();
		const raw = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
		if (!raw) return null;
		const { createHash } = await import("node:crypto");
		return createHash("sha256").update(raw).digest("hex").slice(0, 24);
	} catch {
		return null;
	}
}
async function loadProfile(sql, userId) {
	return (await sql`
    select p.user_id, p.username, p.role, p.wallet_tokens, p.gcash_number, u.email
    from profiles p
    join "user" u on u.id = p.user_id
    where p.user_id = ${userId}
  `)[0] ?? null;
}
async function freeName(sql, base) {
	const root = base.trim().slice(0, 24) || "Member";
	for (let i = 0; i < 8; i += 1) {
		const candidate = i === 0 ? root : `${root.slice(0, 20)} ${i + 1}`;
		if (num((await sql`
      select count(*)::int as n from profiles where lower(username) = lower(${candidate})
    `)[0]?.n) === 0) return candidate;
	}
	return `${root.slice(0, 16)} ${Math.floor(Math.random() * 900 + 100)}`;
}
async function ensureProfile(sql, userId) {
	const existing = await loadProfile(sql, userId);
	if (existing) return existing;
	const user = (await sql`
    select name, email from "user" where id = ${userId}
  `)[0];
	if (!user) throw new Error("Account not found.");
	const base = (user.name || user.email.split("@")[0] || "Member").replace(/[\u0000-\u001f]/g, "").trim().replace(/\s+/g, " ").slice(0, 24) || "Member";
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
	try {
		await sql`
      update profiles
      set role = 'admin'
      where user_id = ${userId}
        and role = 'user'
        and not exists (select 1 from profiles where role = 'admin')
    `;
	} catch (err) {
		if (!isUniqueViolation(err)) throw err;
	}
	const created = await loadProfile(sql, userId);
	if (!created) throw new Error("Could not open your wallet.");
	return created;
}
function toMe(row, adminQueue) {
	return {
		userId: row.user_id,
		username: row.username,
		email: row.email,
		role: asRole(row.role),
		walletTokens: num(row.wallet_tokens),
		gcashNumber: row.gcash_number,
		adminQueue
	};
}
async function requireAdmin(sql, userId) {
	const profile = await ensureProfile(sql, userId);
	if (profile.role !== "admin") throw new Error("Admin only.");
	return profile;
}
var getMe_createServerFn_handler = createServerRpc({
	id: "542db4303661f278e0581ac2429bc4def67d6152c874136a43bc4bc3c51fc1a3",
	name: "getMe",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const profile = await ensureProfile(sql, context.userId);
	if (profile.role !== "admin") return toMe(profile, null);
	return toMe(profile, num((await sql`
      select (
        (select count(*)::int from purchases where status = 'pending')
        + (select count(*)::int from withdrawals where status = 'queued')
      ) as n
    `)[0]?.n));
});
var getFeed_createServerFn_handler = createServerRpc({
	id: "faff7ef5248d7cfac25c04f3abb0691b225854e6b5583f2dff34577c0bd81409",
	name: "getFeed",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getFeed.__executeServer(opts));
var getFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getFeed_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	return (await sql`
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
        exists(
          select 1 from post_likes l
          where l.post_id = f.id and l.user_id = ${context.userId}
        ) as liked,
        exists(
          select 1 from video_views v
          where v.post_id = f.id
            and v.viewer_id = ${context.userId}
            and v.created_at > now() - interval '24 hours'
        ) as counted
      from feed_posts f
      join profiles pr on pr.user_id = f.owner_id
      order by f.created_at desc, f.id desc
      limit 50
    `).map((row) => ({
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
		counted: flag(row.counted)
	}));
});
var getShop_createServerFn_handler = createServerRpc({
	id: "de6f521b7f7740af96d36f2012615298dd04ead81b29da3af5567e4372db8cc7",
	name: "getShop",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getShop.__executeServer(opts));
var getShop = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getShop_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const assets = await sql`
      select id, tier, title, description, price_php, tokens_per_view
      from shop_assets
      order by price_php asc
    `;
	const purchases = await sql`
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
			id: asTier(row.id),
			tier: asTier(row.tier),
			title: row.title,
			description: row.description,
			pricePhp: num(row.price_php),
			tokensPerView: num(row.tokens_per_view)
		})),
		purchases: purchases.map((row) => ({
			id: num(row.id),
			assetId: asTier(row.asset_id),
			tier: asTier(row.tier),
			title: row.title,
			pricePhp: num(row.price_php),
			reference: row.reference_number,
			senderGcash: row.sender_gcash,
			status: asPurchaseStatus(row.status),
			createdAt: stamp(row.created_at)
		}))
	};
});
var submitPurchase_createServerFn_handler = createServerRpc({
	id: "5eef6d4f2ececddb0ef26b15175c691814a6841299e3b3e9e68643ecdb3b9fb7",
	name: "submitPurchase",
	filename: "src/lib/platform.functions.ts"
}, (opts) => submitPurchase.__executeServer(opts));
var submitPurchase = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(submitPurchase_createServerFn_handler, async ({ context, data }) => {
	const body = asObject(data);
	const assetId = asTier(body.assetId);
	if (body.assetId !== "starter" && body.assetId !== "pro" && body.assetId !== "vip") throw new Error("Unknown film.");
	const reference = normalizeRef(String(body.reference ?? ""));
	if (!reference) throw new Error("Enter the GCash reference: 6 to 32 letters or numbers.");
	const sender = normalizeGcash(String(body.senderGcash ?? ""));
	if (!sender) throw new Error("Enter the sender's GCash mobile, like 09171234567.");
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const price = num((await sql`
      select price_php from shop_assets where id = ${assetId}
    `)[0]?.price_php);
	if (!price) throw new Error("That film is not in the shop.");
	try {
		const id = (await sql`
        insert into purchases (user_id, asset_id, price_php, reference_number, sender_gcash)
        values (${context.userId}, ${assetId}, ${price}, ${reference}, ${sender})
        returning id
      `)[0]?.id;
		if (!id) throw new Error("Could not save the receipt.");
		return { id: num(id) };
	} catch (err) {
		if (isUniqueViolation(err)) throw new Error("That GCash reference was already submitted.");
		throw err;
	}
});
var saveGcash_createServerFn_handler = createServerRpc({
	id: "2454e6971c9430b72f6de93fd8e6ba83ac673f34c1ab6c05a6da1ea4cb1f83f2",
	name: "saveGcash",
	filename: "src/lib/platform.functions.ts"
}, (opts) => saveGcash.__executeServer(opts));
var saveGcash = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(saveGcash_createServerFn_handler, async ({ context, data }) => {
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
var getWallet_createServerFn_handler = createServerRpc({
	id: "8971869f8fd43d682673bff39e43e4cba3bf977b489143b549f122cd7f28e6da",
	name: "getWallet",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getWallet.__executeServer(opts));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWallet_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const profile = await ensureProfile(sql, context.userId);
	const ledger = await sql`
      select id, delta, reason, created_at
      from wallet_ledger
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
	const withdrawals = await sql`
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
			createdAt: stamp(row.created_at)
		})),
		withdrawals: withdrawals.map((row) => ({
			id: num(row.id),
			tokens: num(row.tokens),
			amountPhp: num(row.amount_php),
			gcashNumber: row.gcash_number,
			script: row.script,
			status: asWithdrawalStatus(row.status),
			createdAt: stamp(row.created_at)
		}))
	};
});
var requestWithdrawal_createServerFn_handler = createServerRpc({
	id: "bb42b2ac21d0eb30950fd42586af2a3374fa2a33fdff2d8409144f1a8309e3bd",
	name: "requestWithdrawal",
	filename: "src/lib/platform.functions.ts"
}, (opts) => requestWithdrawal.__executeServer(opts));
var requestWithdrawal = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(requestWithdrawal_createServerFn_handler, async ({ context, data }) => {
	const body = asObject(data);
	const tokens = num(body.tokens);
	if (!Number.isInteger(tokens) || tokens < 1e3 || tokens % 1e3 !== 0) throw new Error("Payouts start at 1,000 tokens and move in steps of 1,000.");
	const gcash = normalizeGcash(String(body.gcashNumber ?? ""));
	if (!gcash) throw new Error("Enter the GCash number that should receive the pesos.");
	const sql = await getSql();
	const profile = await ensureProfile(sql, context.userId);
	const amountPhp = tokens / 10;
	const script = payoutScript(profile.username, amountPhp, gcash);
	const row = (await sql`
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
    `)[0];
	if (!row?.id || row.wallet_tokens == null) throw new Error("Not enough tokens for that payout.");
	return {
		balance: num(row.wallet_tokens),
		withdrawal: {
			id: num(row.id),
			tokens: num(row.tokens),
			amountPhp: num(row.amount_php),
			gcashNumber: row.gcash_number ?? gcash,
			script: row.script ?? script,
			status: "queued",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			username: row.username ?? profile.username
		}
	};
});
var toggleLike_createServerFn_handler = createServerRpc({
	id: "9331408a5de42ac4977331610c53cdcc5f0207c6ec23e556697034c82d6884bf",
	name: "toggleLike",
	filename: "src/lib/platform.functions.ts"
}, (opts) => toggleLike.__executeServer(opts));
var toggleLike = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(toggleLike_createServerFn_handler, async ({ context, data }) => {
	const postId = intId(asObject(data).postId, "film");
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	if (!(await sql`select id from feed_posts where id = ${postId}`)[0]) throw new Error("That film is gone.");
	if ((await sql`select 1 as ok from post_likes where post_id = ${postId} and user_id = ${context.userId}`).length > 0) {
		await sql`delete from post_likes where post_id = ${postId} and user_id = ${context.userId}`;
		return {
			liked: false,
			likeCount: num((await sql`
        update feed_posts
        set like_count = greatest(0, like_count - 1)
        where id = ${postId}
        returning like_count
      `)[0]?.like_count)
		};
	}
	await sql`insert into post_likes (post_id, user_id) values (${postId}, ${context.userId})`;
	return {
		liked: true,
		likeCount: num((await sql`
      update feed_posts set like_count = like_count + 1 where id = ${postId} returning like_count
    `)[0]?.like_count)
	};
});
var startWatch_createServerFn_handler = createServerRpc({
	id: "33b4e943ebabbc035faf6eed368e80137f43589203d36f008b9221402770d03a",
	name: "startWatch",
	filename: "src/lib/platform.functions.ts"
}, (opts) => startWatch.__executeServer(opts));
var startWatch = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(startWatch_createServerFn_handler, async ({ context, data }) => {
	const postId = intId(asObject(data).postId, "film");
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const post = (await sql`select owner_id from feed_posts where id = ${postId}`)[0];
	if (!post) return {
		eligible: false,
		reason: "missing"
	};
	if (post.owner_id === context.userId) return {
		eligible: false,
		reason: "self"
	};
	if (num((await sql`
      select count(*)::int as n from video_views
      where post_id = ${postId}
        and viewer_id = ${context.userId}
        and created_at > now() - interval '24 hours'
    `)[0]?.n) > 0) return {
		eligible: false,
		reason: "user_24h"
	};
	const ip = await readIpHash();
	if (ip) {
		if (num((await sql`
        select count(*)::int as n from video_views
        where post_id = ${postId}
          and viewer_ip = ${ip}
          and created_at > now() - interval '24 hours'
      `)[0]?.n) > 0) return {
			eligible: false,
			reason: "ip_24h"
		};
	}
	await sql`
      delete from watch_sessions
      where user_id = ${context.userId} and post_id = ${postId} and claimed = false
    `;
	const sessionId = (await sql`
      insert into watch_sessions (post_id, user_id, ip)
      values (${postId}, ${context.userId}, ${ip})
      returning id
    `)[0]?.id;
	if (!sessionId) return {
		eligible: false,
		reason: "missing"
	};
	return {
		eligible: true,
		sessionId: num(sessionId)
	};
});
var claimWatch_createServerFn_handler = createServerRpc({
	id: "0eaabfd7ed0761150f801d31960c71f300508c9b6bd2de5aece4c0132d6344f9",
	name: "claimWatch",
	filename: "src/lib/platform.functions.ts"
}, (opts) => claimWatch.__executeServer(opts));
var claimWatch = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(claimWatch_createServerFn_handler, async ({ context, data }) => {
	const sessionId = intId(asObject(data).sessionId, "session");
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const row = (await sql`
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
    `)[0];
	if (!row) return {
		ok: false,
		reason: "missing"
	};
	if (flag(row.claimed)) return {
		ok: false,
		reason: "already"
	};
	if (num(row.age) < 5) return {
		ok: false,
		reason: "too_soon"
	};
	if (row.owner_id === context.userId) return {
		ok: false,
		reason: "self"
	};
	if (flag(row.recent_user)) return {
		ok: false,
		reason: "user_24h"
	};
	if (flag(row.recent_ip)) return {
		ok: false,
		reason: "ip_24h"
	};
	const done = (await sql`
      with lk as (
        select pg_advisory_xact_lock(hashtext(${`viewpost:${row.post_id}`})) as locked
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
    `)[0];
	if (done?.tokens == null || done.view_count == null) return {
		ok: false,
		reason: "already"
	};
	return {
		ok: true,
		tokens: num(done.tokens),
		viewCount: num(done.view_count)
	};
});
var getAdmin_createServerFn_handler = createServerRpc({
	id: "75fdaa75a272255d5060e6d6a28457d2ecb4235cb54d70bd43bbc0a35b09da32",
	name: "getAdmin",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getAdmin.__executeServer(opts));
var getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const pendingRows = await sql`
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
	const recentRows = await sql`
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
	const mapPurchase = (row) => ({
		id: num(row.id),
		assetId: asTier(row.asset_id),
		tier: asTier(row.tier),
		title: row.title,
		pricePhp: num(row.price_php),
		reference: row.reference_number,
		senderGcash: row.sender_gcash,
		status: asPurchaseStatus(row.status),
		createdAt: stamp(row.created_at),
		username: row.username,
		email: row.email
	});
	const payoutRows = await sql`
      select w.id, w.tokens, w.amount_php, w.gcash_number, w.script, w.status, w.created_at,
             pr.username, u.email
      from withdrawals w
      join profiles pr on pr.user_id = w.user_id
      join "user" u on u.id = w.user_id
      where w.status = 'queued'
      order by w.created_at asc
      limit 50
    `;
	const paidRows = await sql`
      select w.id, w.tokens, w.amount_php, w.gcash_number, w.script, w.status, w.created_at,
             pr.username, u.email
      from withdrawals w
      join profiles pr on pr.user_id = w.user_id
      join "user" u on u.id = w.user_id
      where w.status <> 'queued'
      order by w.resolved_at desc nulls last
      limit 8
    `;
	const mapWithdrawal = (row) => ({
		id: num(row.id),
		tokens: num(row.tokens),
		amountPhp: num(row.amount_php),
		gcashNumber: row.gcash_number,
		script: row.script,
		status: asWithdrawalStatus(row.status),
		createdAt: stamp(row.created_at),
		username: row.username,
		email: row.email
	});
	return {
		purchases: pendingRows.map(mapPurchase),
		recent: recentRows.map(mapPurchase),
		payouts: payoutRows.map(mapWithdrawal),
		paid: paidRows.map(mapWithdrawal)
	};
});
var reviewPurchase_createServerFn_handler = createServerRpc({
	id: "2dde1fa5fd08b3fe7e2602dd13879aab80aeb22b8a57fac980b2292dac3acff4",
	name: "reviewPurchase",
	filename: "src/lib/platform.functions.ts"
}, (opts) => reviewPurchase.__executeServer(opts));
var reviewPurchase = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(reviewPurchase_createServerFn_handler, async ({ context, data }) => {
	const body = asObject(data);
	const purchaseId = intId(body.purchaseId, "receipt");
	const decision = body.decision === "approve" ? "approve" : body.decision === "reject" ? "reject" : null;
	if (!decision) throw new Error("Choose approve or reject.");
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (decision === "reject") {
		const rows = await sql`
        update purchases
        set status = 'rejected', reviewed_at = now()
        where id = ${purchaseId} and status = 'pending'
        returning id
      `;
		return { ok: Boolean(rows[0]) };
	}
	return { ok: (await sql`
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
    `)[0]?.post_id != null };
});
var reviewWithdrawal_createServerFn_handler = createServerRpc({
	id: "938c8e88fed1bbc3424edd7718f349001730b85282a5e0d4350c1917fc12658a",
	name: "reviewWithdrawal",
	filename: "src/lib/platform.functions.ts"
}, (opts) => reviewWithdrawal.__executeServer(opts));
var reviewWithdrawal = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(reviewWithdrawal_createServerFn_handler, async ({ context, data }) => {
	const body = asObject(data);
	const withdrawalId = intId(body.withdrawalId, "payout");
	const decision = body.decision === "paid" ? "paid" : body.decision === "reject" ? "reject" : null;
	if (!decision) throw new Error("Choose paid or reject.");
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (decision === "paid") {
		const rows = await sql`
        update withdrawals
        set status = 'paid', resolved_at = now()
        where id = ${withdrawalId} and status = 'queued'
        returning id
      `;
		return { ok: Boolean(rows[0]) };
	}
	return { ok: num((await sql`
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
    `)[0]?.n) > 0 };
});
//#endregion
export { claimWatch_createServerFn_handler, getAdmin_createServerFn_handler, getFeed_createServerFn_handler, getMe_createServerFn_handler, getShop_createServerFn_handler, getWallet_createServerFn_handler, requestWithdrawal_createServerFn_handler, reviewPurchase_createServerFn_handler, reviewWithdrawal_createServerFn_handler, saveGcash_createServerFn_handler, startWatch_createServerFn_handler, submitPurchase_createServerFn_handler, toggleLike_createServerFn_handler };

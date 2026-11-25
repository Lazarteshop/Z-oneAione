import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";

export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

function clean(value: unknown, max: number): string {
  return [...String(value ?? "")]
    .filter((ch) => ch.charCodeAt(0) >= 0x20)
    .join("")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
}

export function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    if (/^[0-9a-fA-F]*$/.test(hex) && hex.length % 2 === 0) {
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      return out;
    }
  }
  throw new Error("Could not read that video.");
}

export async function createExclusiveFilm(input: {
  userId: string;
  title: string;
  description: string;
  pricePhp: number;
  tokensPerView: number;
  tier: "starter" | "pro" | "vip";
  mime: string;
  bytes: Uint8Array;
}): Promise<{ id: string }> {
  if (!input.mime.startsWith("video/")) throw new Error("Choose a video file.");
  if (input.bytes.byteLength < 1 || input.bytes.byteLength > MAX_VIDEO_BYTES) {
    throw new Error("Use a video under 25 MB.");
  }
  const title = clean(input.title, 80);
  const description = clean(input.description, 240);
  if (title.length < 2) throw new Error("Give the film a title.");
  if (description.length < 2) throw new Error("Add a short description.");
  if (!Number.isInteger(input.pricePhp) || input.pricePhp < 1 || input.pricePhp > 100_000) {
    throw new Error("Enter a price in pesos.");
  }
  if (!Number.isInteger(input.tokensPerView) || input.tokensPerView < 1 || input.tokensPerView > 100) {
    throw new Error("Enter a token rate from 1 to 100.");
  }

  const sql = await getSql();
  const role = await sql<{ role: string }>`select role from profiles where user_id = ${input.userId}`;
  if (role[0]?.role !== "admin") throw new Error("Admin only.");

  const id = `f${randomBytes(6).toString("hex")}`;
  await sql`
    insert into shop_assets (id, tier, title, description, price_php, tokens_per_view, duration_sec, listed, exclusive)
    values (${id}, ${input.tier}, ${title}, ${description}, ${input.pricePhp}, ${input.tokensPerView}, 16, true, true)
  `;
  try {
    await sql.query(
      "insert into shop_videos (asset_id, mime, bytes) values ($1, $2, $3)",
      [id, input.mime, Buffer.from(input.bytes)],
    );
  } catch (err) {
    await sql`delete from shop_assets where id = ${id}`;
    throw err;
  }
  return { id };
}

export async function readShopVideo(assetId: string): Promise<{ mime: string; bytes: Uint8Array } | null> {
  if (!/^[a-z0-9_-]{1,40}$/.test(assetId)) return null;
  const sql = await getSql();
  const rows = await sql<{ mime: string; bytes: unknown }>`
    select mime, bytes from shop_videos where asset_id = ${assetId}
  `;
  const row = rows[0];
  if (!row?.mime) return null;
  return { mime: row.mime, bytes: toBytes(row.bytes) };
}

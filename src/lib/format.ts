export function pesos(php: number): string {
  const whole = Math.abs(php - Math.round(php)) < 0.001;
  return `₱${php.toLocaleString("en-PH", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function tokenValue(tokens: number): string {
  return pesos(tokens / 10);
}

export function ago(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function normalizeGcash(input: string): string | null {
  let n = input.replace(/[^\d]/g, "");
  if (n.startsWith("63") && n.length === 12) n = `0${n.slice(2)}`;
  if (!/^09\d{9}$/.test(n)) return null;
  return n;
}

export function formatGcash(n: string): string {
  if (n.length !== 11) return n;
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
}

export function normalizeRef(input: string): string | null {
  const s = input.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{6,32}$/.test(s)) return null;
  return s;
}

export function payoutScript(username: string, amountPhp: number, gcash: string): string {
  const amount = amountPhp.toLocaleString("en-PH", { maximumFractionDigits: 0 });
  return `Hello Admin, I am ${username}, requesting a payout of ₱${amount} to my GCash number ${formatGcash(gcash)}.`;
}

export function errorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Something went wrong. Try again.";
}

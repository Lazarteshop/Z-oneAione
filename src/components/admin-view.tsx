import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FilmVideo } from "@/components/film-video";
import { PayoutFilm } from "@/components/payout-film";
import { Reel } from "@/components/reel";
import { Button, Field, inputClass } from "@/components/ui";
import { getBearerToken } from "@/lib/auth/client";
import { ago, errorText, formatGcash, pesos } from "@/lib/format";
import { deleteShopFilm, getAdmin, reviewPurchase, reviewWithdrawal, type Purchase, type ShopAsset, type Withdrawal } from "@/lib/platform.functions";
import { useUi } from "@/lib/ui-store";

type AdminPurchase = Purchase & { username: string; email: string };

export function AdminView() {
  const [tab, setTab] = useState<"pay" | "out" | "films">("pay");
  const [purchases, setPurchases] = useState<AdminPurchase[] | null>(null);
  const [recent, setRecent] = useState<AdminPurchase[]>([]);
  const [payouts, setPayouts] = useState<Withdrawal[]>([]);
  const [paid, setPaid] = useState<Withdrawal[]>([]);
  const [films, setFilms] = useState<ShopAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [drop, setDrop] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("150");
  const [tokens, setTokens] = useState("2");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const touch = useUi((s) => s.touch);
  const revision = useUi((s) => s.revision);

  function apply(res: Awaited<ReturnType<typeof getAdmin>>) {
    setPurchases(res.purchases);
    setRecent(res.recent);
    setPayouts(res.payouts);
    setPaid(res.paid);
    setFilms(res.films);
    setError(null);
  }

  function load() {
    return getAdmin().then(apply).catch((err) => setError(errorText(err)));
  }

  useEffect(() => {
    let cancel = false;
    getAdmin()
      .then((res) => {
        if (cancel) return;
        apply(res);
      })
      .catch((err) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [revision]);

  async function decidePurchase(id: number, decision: "approve" | "reject") {
    setBusy(`p-${id}`);
    try {
      const res = await reviewPurchase({ data: { purchaseId: id, decision } });
      if (!res.ok) toast.error("That receipt was already reviewed.");
      else toast.success(decision === "approve" ? "Published to the feed" : "Receipt rejected");
      touch();
      await load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  async function decidePayout(id: number, decision: "paid" | "reject") {
    setBusy(`w-${id}`);
    try {
      const res = await reviewWithdrawal({ data: { withdrawalId: id, decision } });
      if (!res.ok) toast.error("That payout was already closed.");
      else toast.success(decision === "paid" ? "Marked paid" : "Tokens returned");
      setConfirm(null);
      touch();
      await load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  async function addFilm(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      toast.error("Choose a video from your gallery.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Use a video under 25 MB.");
      return;
    }
    setBusy("add-film");
    try {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);
      body.set("pricePhp", price);
      body.set("tokensPerView", tokens);
      body.set("tier", "starter");
      body.set("video", file);
      const headers = new Headers();
      const token = getBearerToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const res = await fetch("/api/films/", { method: "POST", body, headers, credentials: "same-origin" });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(payload?.error || "Could not save that video.");
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Video added. One buyer, then it shows sold out.");
      touch();
      await load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  async function removeFilm(id: string) {
    setBusy(`f-${id}`);
    try {
      const res = await deleteShopFilm({ data: { assetId: id } });
      toast.success(res.kept ? "Removed from the shop. Copies already on the feed stay up." : "Film deleted");
      setDrop(null);
      touch();
      await load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  if (error && purchases == null) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-4xl">Admin</h1>
        <p className="mt-3 text-muted">{error === "Admin only." ? "This desk is only for the admin account." : error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Admin</h1>
          <p className="mt-1 text-sm text-muted">Match receipts. Add or remove shop films. Listen to payout films.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("pay")}
            aria-selected={tab === "pay"}
            className={`h-11 rounded-full px-4 text-sm ${tab === "pay" ? "bg-raised text-fg" : "text-muted"}`}
          >
            Payments {purchases ? `(${purchases.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("out")}
            aria-selected={tab === "out"}
            className={`h-11 rounded-full px-4 text-sm ${tab === "out" ? "bg-raised text-fg" : "text-muted"}`}
          >
            Withdrawals ({payouts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("films")}
            aria-selected={tab === "films"}
            className={`h-11 rounded-full px-4 text-sm ${tab === "films" ? "bg-raised text-fg" : "text-muted"}`}
          >
            Films ({films.length})
          </button>
        </div>
      </div>

      {tab === "pay" ? (
        <div className="space-y-3">
          {purchases?.length === 0 ? <p className="text-muted">No receipts waiting.</p> : null}
          {purchases == null ? <div className="h-32 animate-pulse rounded-2xl bg-surface" /> : null}
          {purchases?.map((row) => (
            <article key={row.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl">{row.title}</h2>
                <p className="font-display text-2xl tabular-nums">{pesos(row.pricePhp)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {row.username} · {row.email} · {ago(row.createdAt)}
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Reference</dt>
                  <dd className="tracking-widest">{row.reference}</dd>
                </div>
                <div>
                  <dt className="text-muted">Sender GCash</dt>
                  <dd className="tabular-nums">{formatGcash(row.senderGcash)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button type="button" disabled={busy === `p-${row.id}`} onClick={() => void decidePurchase(row.id, "approve")}>
                  Approve
                </Button>
                <Button type="button" variant="danger" disabled={busy === `p-${row.id}`} onClick={() => void decidePurchase(row.id, "reject")}>
                  Reject
                </Button>
              </div>
            </article>
          ))}
          {recent.length > 0 ? (
            <div className="pt-4">
              <h2 className="text-sm font-semibold tracking-widest text-muted">RECENT</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {recent.map((row) => (
                  <li key={row.id} className="flex justify-between gap-3 border-b border-line py-2">
                    <span>{row.username} · {row.reference}</span>
                    <span className={row.status === "approved" ? "text-ok" : "text-danger"}>{row.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : tab === "films" ? (
        <div className="space-y-4">
          <form onSubmit={(event) => void addFilm(event)} className="space-y-4 rounded-2xl bg-surface p-4 shadow-card">
            <h2 className="font-display text-2xl">Upload a video</h2>
            <p className="text-sm text-muted">Pick a video from your phone gallery. Only one user can buy it. After that, the shop says sold out.</p>
            <Field label="Title">
              <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2} maxLength={80} />
            </Field>
            <Field label="Description">
              <textarea
                className={`${inputClass} h-24 py-3`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                minLength={2}
                maxLength={240}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (₱)">
                <input className={inputClass} inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} required />
              </Field>
              <Field label="Tokens per view">
                <input className={inputClass} inputMode="numeric" value={tokens} onChange={(event) => setTokens(event.target.value)} required />
              </Field>
            </div>
            <Field label="AI video" hint="Gallery file. MP4, MOV, or WebM. Under 25 MB.">
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                required
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-3 file:h-11 file:rounded-full file:border-0 file:bg-accent file:px-4 file:font-semibold file:text-accent-ink"
              />
            </Field>
            <Button type="submit" disabled={busy === "add-film"}>
              {busy === "add-film" ? "Uploading…" : "Upload to shop"}
            </Button>
          </form>
          {films.length === 0 ? <p className="text-muted">No films in the shop.</p> : null}
          {films.map((film) => (
            <article key={film.id} className="grid gap-3 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-[9rem_1fr]">
              <div className="relative aspect-video overflow-hidden rounded-xl">
                {film.hasVideo ? <FilmVideo assetId={film.id} /> : <Reel tier={film.tier} playing={false} seed={film.pricePhp} />}
                {film.soldOut ? (
                  <p className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="rounded-full bg-bg/90 px-3 py-1 text-xs font-semibold tracking-widest">SOLD OUT</span>
                  </p>
                ) : null}
              </div>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-2xl">{film.title}</h2>
                  <p className="font-display text-2xl tabular-nums">{pesos(film.pricePhp)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{film.description}</p>
                <p className="mt-2 text-sm text-accent">{film.tokensPerView} tokens / valid view · {film.tier}</p>
                <div className="mt-3">
                  {drop === film.id ? (
                    <Button type="button" variant="danger" disabled={busy === `f-${film.id}`} onClick={() => void removeFilm(film.id)}>
                      Confirm delete
                    </Button>
                  ) : (
                    <Button type="button" variant="danger" onClick={() => setDrop(film.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.length === 0 ? <p className="text-muted">No payout films waiting.</p> : null}
          {payouts.map((row) => (
            <article key={row.id} className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl">{row.username}</h2>
                <p className="font-display text-2xl tabular-nums">{pesos(row.amountPhp)}</p>
              </div>
              <p className="text-sm text-muted">
                {row.email} · {formatGcash(row.gcashNumber)} · {row.tokens} tokens · {ago(row.createdAt)}
              </p>
              <PayoutFilm
                script={row.script}
                username={row.username ?? "Member"}
                amountLabel={pesos(row.amountPhp)}
                gcash={row.gcashNumber}
              />
              <div className="flex flex-wrap gap-2">
                {confirm === row.id ? (
                  <Button type="button" disabled={busy === `w-${row.id}`} onClick={() => void decidePayout(row.id, "paid")}>
                    Confirm paid
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setConfirm(row.id)}>
                    Mark as paid
                  </Button>
                )}
                <Button type="button" variant="danger" disabled={busy === `w-${row.id}`} onClick={() => void decidePayout(row.id, "reject")}>
                  Reject and refund
                </Button>
              </div>
            </article>
          ))}
          {paid.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {paid.map((row) => (
                <li key={row.id} className="flex justify-between gap-3 border-b border-line py-2">
                  <span>{row.username} · {pesos(row.amountPhp)}</span>
                  <span className={row.status === "paid" ? "text-ok" : "text-danger"}>{row.status}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

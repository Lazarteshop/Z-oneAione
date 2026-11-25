import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Reel } from "@/components/reel";
import { FilmVideo } from "@/components/film-video";
import { Button, Field, Modal, inputClass } from "@/components/ui";
import { PLATFORM } from "@/lib/catalog";
import { ago, errorText, formatGcash, normalizeGcash, normalizeRef, pesos } from "@/lib/format";
import { palette } from "@/lib/palette";
import { getShop, submitPurchase, type Purchase, type ShopAsset } from "@/lib/platform.functions";
import { useUi } from "@/lib/ui-store";

function QrSlip({ price }: { price: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancel = false;
    QRCode.toDataURL(PLATFORM.qrPayload, {
      margin: 1,
      width: 280,
      color: { dark: palette.bg, light: palette.fg },
    })
      .then((url) => {
        if (!cancel) setSrc(url);
      })
      .catch(() => {
        if (!cancel) setSrc(null);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="rounded-2xl bg-fg p-4 text-bg">
      <p className="text-xs font-semibold tracking-widest">PLATFORM GCASH</p>
      <div className="mt-3 grid place-items-center rounded-xl bg-fg">
        {src ? (
          <img src={src} alt="GCash QR for AI Video Shop" className="size-52" />
        ) : (
          <p className="grid size-52 place-items-center text-center text-sm">{PLATFORM.gcashDisplay}</p>
        )}
      </div>
      <p className="mt-3 font-display text-2xl">{PLATFORM.name}</p>
      <p className="tabular-nums">{PLATFORM.gcashDisplay}</p>
      <p className="mt-2 text-sm">Pay exactly {pesos(price)}, then submit the receipt below.</p>
      {PLATFORM.livePayments ? null : (
        <p className="mt-2 text-sm">
          Demo checkout. Do not send real money. Swap this QR for a live merchant code before taking payments.
        </p>
      )}
    </div>
  );
}

function Checkout({ asset, onClose, onDone }: { asset: ShopAsset; onClose: () => void; onDone: () => void }) {
  const [reference, setReference] = useState("");
  const [sender, setSender] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!normalizeRef(reference)) {
      setError("Reference must be 6 to 32 letters or numbers, and unique.");
      return;
    }
    if (!normalizeGcash(sender)) {
      setError("Use a mobile number like 09171234567.");
      return;
    }
    setBusy(true);
    try {
      await submitPurchase({ data: { assetId: asset.id, reference, senderGcash: sender } });
      toast.success("Receipt submitted. An admin still has to approve it.");
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Buy ${asset.title}`} onClose={onClose}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">{asset.title}</h2>
          <p className="text-sm text-muted">{pesos(asset.pricePhp)} · {asset.tokensPerView} tokens per valid view</p>
        </div>
        <button type="button" onClick={onClose} className="h-11 px-2 text-sm text-muted">
          Close
        </button>
      </div>
      <QrSlip price={asset.pricePhp} />
      <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-4">
        <Field label="GCash reference number" hint="Each receipt can be used once. Spaces are ignored.">
          <input
            className={inputClass}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            autoComplete="off"
            placeholder="903311224455"
            required
          />
        </Field>
        <Field label="Sender's GCash mobile">
          <input
            className={inputClass}
            value={sender}
            onChange={(event) => setSender(event.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="09XXXXXXXXX"
            required
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Submitting…" : "Submit receipt"}
        </Button>
      </form>
    </Modal>
  );
}

const statusLabel: Record<Purchase["status"], string> = {
  pending: "Pending",
  approved: "Published",
  rejected: "Rejected",
};

export function ShopView() {
  const [assets, setAssets] = useState<ShopAsset[] | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<ShopAsset | null>(null);
  const revision = useUi((s) => s.revision);
  const touch = useUi((s) => s.touch);

  useEffect(() => {
    let cancel = false;
    getShop()
      .then((res) => {
        if (cancel) return;
        setAssets(res.assets);
        setPurchases(res.purchases);
        setError(null);
      })
      .catch((err) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [revision]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Shop</h1>
        <p className="mt-2 max-w-xl text-muted">
          Buy a film, send the receipt, and wait. A video the admin uploaded can be bought once. After that the card says sold out.
        </p>
      </div>
      {error ? <p className="text-danger">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {(assets ?? []).map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-2xl bg-surface shadow-card">
            <div className="relative aspect-video">
              {asset.hasVideo ? <FilmVideo assetId={asset.id} /> : <Reel tier={asset.tier} playing seed={asset.pricePhp} />}
              {asset.soldOut ? (
                <p className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/45">
                  <span className="rounded-full bg-bg px-4 py-2 text-sm font-semibold tracking-widest">SOLD OUT</span>
                </p>
              ) : null}
            </div>
            <div className="space-y-3 p-4">
              <h2 className="font-display text-2xl">{asset.title}</h2>
              <p className="text-sm text-muted">{asset.description}</p>
              <p className="font-display text-3xl tabular-nums">{pesos(asset.pricePhp)}</p>
              <p className="text-sm text-accent">{asset.tokensPerView} tokens / valid view</p>
              {asset.soldOut ? (
                <p className="grid h-11 place-items-center rounded-full bg-raised text-sm font-semibold tracking-widest text-muted">Sold out</p>
              ) : (
                <Button type="button" className="w-full" onClick={() => setOpen(asset)}>
                  Buy asset
                </Button>
              )}
            </div>
          </article>
        ))}
        {assets == null && !error ? <div className="h-80 animate-pulse rounded-2xl bg-surface md:col-span-3" /> : null}
      </div>
      <section>
        <h2 className="font-display text-2xl">Your receipts</h2>
        {purchases.length === 0 ? <p className="mt-2 text-sm text-muted">None yet.</p> : null}
        <ul className="mt-3 space-y-2">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line px-3 py-3 text-sm">
              <span>
                {purchase.title}
                <span className="text-muted"> · {purchase.reference}</span>
              </span>
              <span className={purchase.status === "rejected" ? "text-danger" : purchase.status === "approved" ? "text-ok" : "text-accent"}>
                {statusLabel[purchase.status]} · {formatGcash(purchase.senderGcash)} · {ago(purchase.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {open ? (
        <Checkout
          asset={open}
          onClose={() => setOpen(null)}
          onDone={() => {
            setOpen(null);
            touch();
          }}
        />
      ) : null}
    </div>
  );
}

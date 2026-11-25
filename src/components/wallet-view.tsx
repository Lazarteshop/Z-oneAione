import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { PayoutFilm } from "@/components/payout-film";
import { Button, Field, inputClass } from "@/components/ui";
import { MIN_WITHDRAW_TOKENS } from "@/lib/catalog";
import { ago, errorText, formatGcash, normalizeGcash, payoutScript, pesos, tokenValue } from "@/lib/format";
import {
  getWallet,
  requestWithdrawal,
  saveGcash,
  type LedgerRow,
  type Withdrawal,
} from "@/lib/platform.functions";
import { useUi } from "@/lib/ui-store";

const reasonLabel: Record<string, string> = {
  view: "Valid view",
  withdrawal: "Payout reserved",
  withdrawal_refund: "Payout returned",
};

export function WalletView() {
  const [balance, setBalance] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [gcash, setGcash] = useState("");
  const [amount, setAmount] = useState(MIN_WITHDRAW_TOKENS);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [film, setFilm] = useState<Withdrawal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const setTokens = useUi((s) => s.setTokens);
  const touch = useUi((s) => s.touch);
  const revision = useUi((s) => s.revision);

  useEffect(() => {
    let cancel = false;
    getWallet()
      .then((res) => {
        if (cancel) return;
        setBalance(res.me.walletTokens);
        setUsername(res.me.username);
        setGcash(res.me.gcashNumber ?? "");
        setLedger(res.ledger);
        setWithdrawals(res.withdrawals);
        setTokens(res.me.walletTokens);
      })
      .catch((err) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [revision, setTokens]);

  const max = balance == null ? 0 : Math.floor(balance / MIN_WITHDRAW_TOKENS) * MIN_WITHDRAW_TOKENS;
  const unlocked = max >= MIN_WITHDRAW_TOKENS;
  const sampleNumber = normalizeGcash(gcash);

  async function saveNumber() {
    setError(null);
    if (!sampleNumber) {
      setError("Enter a Philippine mobile number, like 09171234567.");
      return;
    }
    setBusy(true);
    try {
      await saveGcash({ data: { gcashNumber: sampleNumber } });
      toast.success("GCash number saved");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!sampleNumber || !unlocked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await requestWithdrawal({ data: { tokens: amount, gcashNumber: sampleNumber } });
      setBalance(res.balance);
      setTokens(res.balance);
      setFilm(res.withdrawal);
      setWithdrawals((rows) => [res.withdrawal, ...rows]);
      touch();
      toast.success("Payout film queued for admin");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const progress = Math.min(100, ((balance ?? 0) / MIN_WITHDRAW_TOKENS) * 100);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="text-sm text-muted">AI wallet{username ? ` · ${username}` : ""}</p>
        <h1 className="font-display text-5xl tabular-nums">{balance == null ? "—" : tokenValue(balance)}</h1>
        <p className="mt-1 text-muted tabular-nums">{balance ?? 0} tokens · 10 tokens = ₱1 · your own views never pay you</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-raised">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {unlocked
            ? "Payout is open."
            : `${Math.max(0, MIN_WITHDRAW_TOKENS - (balance ?? 0))} tokens until the minimum ₱100 payout.`}
        </p>
      </div>

      <section className="space-y-4 rounded-2xl bg-surface p-4 shadow-card">
        <Field label="Payout GCash number" hint="This is the number spoken in the payout film.">
          <input
            className={inputClass}
            value={gcash}
            onChange={(event) => setGcash(event.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="09XXXXXXXXX"
          />
        </Field>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void saveNumber()}>
          Save number
        </Button>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">Amount</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-raised"
              disabled={!unlocked || amount <= MIN_WITHDRAW_TOKENS}
              onClick={() => setAmount((value) => Math.max(MIN_WITHDRAW_TOKENS, value - MIN_WITHDRAW_TOKENS))}
              aria-label="Decrease payout"
            >
              <Minus className="size-4" />
            </button>
            <p className="w-28 text-center font-display text-2xl tabular-nums">
              {unlocked ? pesos(amount / 10) : pesos(100)}
            </p>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-raised"
              disabled={!unlocked || amount + MIN_WITHDRAW_TOKENS > max}
              onClick={() => setAmount((value) => value + MIN_WITHDRAW_TOKENS)}
              aria-label="Increase payout"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="button" className="w-full" disabled={!unlocked || busy || !sampleNumber} onClick={() => void withdraw()}>
          {unlocked ? "Withdraw via AI TTS video" : "Withdraw locked"}
        </Button>
        {sampleNumber ? (
          <div className="border-t border-line pt-4">
            <p className="mb-3 text-sm text-muted">Rehearsal only. This is not sent to admin and does not move tokens.</p>
            <PayoutFilm
              script={payoutScript(username || "Member", unlocked ? amount / 10 : 100, sampleNumber)}
              username={username || "Member"}
              amountLabel={pesos(unlocked ? amount / 10 : 100)}
              gcash={sampleNumber}
            />
          </div>
        ) : null}
      </section>

      {film ? (
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Queued payout</h2>
          <PayoutFilm
            script={film.script}
            username={username}
            amountLabel={pesos(film.amountPhp)}
            gcash={film.gcashNumber}
          />
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-2xl">Ledger</h2>
        {ledger.length === 0 ? <p className="mt-2 text-sm text-muted">No token movement yet.</p> : null}
        <ul className="mt-3 divide-y divide-line">
          {ledger.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between py-3 text-sm">
              <span>
                {reasonLabel[row.reason] ?? row.reason}
                <span className="text-muted"> · {ago(row.createdAt)}</span>
              </span>
              <span className="tabular-nums">{row.delta > 0 ? `+${row.delta}` : row.delta}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">Payouts</h2>
        {withdrawals.length === 0 ? <p className="mt-2 text-sm text-muted">None yet.</p> : null}
        <ul className="mt-3 space-y-2">
          {withdrawals.map((row) => (
            <li key={row.id} className="rounded-xl border border-line px-3 py-3 text-sm">
              <span className="font-semibold">{pesos(row.amountPhp)}</span>
              <span className="text-muted"> · {formatGcash(row.gcashNumber)} · {row.status} · {ago(row.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { TIERS } from "@/lib/catalog";
import { pesos } from "@/lib/format";

export function Landing({ ready }: { ready: boolean }) {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-display text-2xl">AI Video Shop</p>
        {ready ? (
          <div className="flex items-center gap-3">
            <Link to="/admin-login" className="inline-flex h-11 items-center text-sm text-muted">
              Admin
            </Link>
            <Link to="/login" className="inline-flex h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink">
              Sign in
            </Link>
          </div>
        ) : (
          <span className="inline-flex h-11 w-24 rounded-full bg-raised" />
        )}
      </header>
      <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs font-semibold tracking-widest text-accent">AI VIDEO SHOP</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Buy a film. Earn when it is actually watched.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Three films. A view counts after five seconds, once per person and once per network each day.
            Ten tokens make one peso. A payout starts at one thousand tokens.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-raised px-3 py-2">5 seconds</span>
            <span className="rounded-full bg-raised px-3 py-2">10 tokens = ₱1</span>
            <span className="rounded-full bg-raised px-3 py-2">Min payout ₱100</span>
          </div>
          {ready ? (
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink"
            >
              Create an account
            </Link>
          ) : (
            <span className="mt-8 inline-flex h-12 w-44 rounded-full bg-raised" />
          )}
        </div>
        <div className="space-y-3">
          {TIERS.map((tier) => (
            <article key={tier.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl">{tier.title}</h2>
                <p className="font-display text-2xl tabular-nums">{pesos(tier.pricePhp)}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{tier.blurb}</p>
              <p className="mt-3 text-sm text-accent">{tier.tokensPerView} tokens per valid view</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-20 md:grid-cols-3">
        {[
          ["1", "Pay in GCash", "Submit a reference number that has never been used. An admin matches the receipt."],
          ["2", "It hits the feed", "Approved films publish under your name, with a view counter and likes."],
          ["3", "Cash out by film", "At 1,000 tokens the app speaks a payout request and queues it for admin."],
        ].map(([step, title, body]) => (
          <article key={step} className="rounded-2xl border border-line p-4">
            <p className="font-display text-3xl text-accent">{step}</p>
            <h2 className="mt-2 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

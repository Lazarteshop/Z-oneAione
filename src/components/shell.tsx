import { useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Shield, Store, Wallet } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { tokenValue } from "@/lib/format";
import { getMe } from "@/lib/platform.functions";
import { useUi } from "@/lib/ui-store";

const links = [
  { to: "/", label: "Feed", icon: Clapperboard },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/wallet", label: "Wallet", icon: Wallet },
] as const;

export function BootScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5">
      <p className="text-xs font-semibold tracking-widest text-accent">AI VIDEO SHOP</p>
      <h1 className="mt-3 font-display text-4xl text-fg">Buy a film. Earn when it is actually watched.</h1>
      <p className="mt-4 text-muted">Opening your session…</p>
    </main>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  badge,
  stacked,
}: {
  to: "/" | "/shop" | "/wallet" | "/admin";
  label: string;
  icon: typeof Store;
  badge?: number | null;
  stacked?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      className={
        stacked
          ? "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs text-muted"
          : "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm text-muted"
      }
      activeProps={{
        className: stacked
          ? "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs text-accent"
          : "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-raised px-3 text-sm text-fg",
      }}
    >
      <Icon className="size-4" />
      <span>
        {label}
        {stacked && badge != null && badge > 0 ? ` ${badge}` : ""}
      </span>
      {!stacked && badge != null && badge > 0 ? (
        <span className="rounded-full bg-accent px-2 text-xs font-semibold text-accent-ink tabular-nums">{badge}</span>
      ) : null}
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const tokens = useUi((s) => s.tokens);
  const queue = useUi((s) => s.queue);
  const revision = useUi((s) => s.revision);
  const setSnapshot = useUi((s) => s.setSnapshot);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    getMe()
      .then((me) => {
        if (!cancel) setSnapshot(me.walletTokens, me.adminQueue);
      })
      .catch(() => {
        if (!cancel) setSnapshot(0, null);
      });
    return () => {
      cancel = true;
    };
  }, [user?.id, revision, setSnapshot]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="font-display text-xl leading-none md:text-2xl">
            AI Video Shop
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/wallet"
              className="inline-flex h-11 items-center rounded-full bg-raised px-3 text-sm font-semibold tabular-nums"
            >
              {tokens == null ? "Wallet" : tokenValue(tokens)}
            </Link>
            <UserButton />
          </div>
          <nav className="hidden w-full gap-1 md:flex">
            {links.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
            {queue != null ? <NavLink to="/admin" label="Admin" icon={Shield} badge={queue} /> : null}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-bg/95 backdrop-blur md:hidden">
        {links.map((item) => (
          <NavLink key={item.to} {...item} stacked />
        ))}
        {queue != null ? <NavLink to="/admin" label="Admin" icon={Shield} badge={queue} stacked /> : null}
      </nav>
    </div>
  );
}

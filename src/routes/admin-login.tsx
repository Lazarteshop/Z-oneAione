import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { authClient, authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BootScreen } from "@/components/shell";
import { Button, Field, inputClass } from "@/components/ui";
import { errorText } from "@/lib/format";
import { adminDeskStatus, claimAdmin, getMe } from "@/lib/platform.functions";

type AdminSearch = { denied?: "user" | "taken" };

export const Route = createFileRoute("/admin-login")({
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    denied: search.denied === "user" || search.denied === "taken" ? search.denied : undefined,
  }),
  head: () => ({ meta: [{ title: "Admin sign in · AI Video Shop" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, isPending } = useCurrentUserState();
  const { denied } = Route.useSearch();
  const router = useRouter();
  const [open, setOpen] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [role, setRole] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    let cancel = false;
    getMe()
      .then((me) => {
        if (!cancel) setRole(me.role);
      })
      .catch(() => {
        if (!cancel) setRole("user");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancel = false;
    adminDeskStatus()
      .then((status) => {
        if (cancel) return;
        setOpen(status.open);
        setMode(status.open ? "in" : "up");
      })
      .catch(() => {
        if (!cancel) setOpen(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  if (isPending || open == null || (user && role == null && !denied)) return <BootScreen />;
  if (user && role === "admin" && !denied) return <Navigate to="/admin" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!authEnabled) {
      setError("Sign-in is disabled.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name: name.trim() })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Could not sign in.");
        return;
      }
      if (mode === "up") {
        const claimed = await claimAdmin();
        if (!claimed.ok) {
          await signOut("/admin-login?denied=taken");
          return;
        }
      }
      const me = await getMe();
      if (me.role !== "admin") {
        await signOut("/admin-login?denied=user");
        return;
      }
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const deniedCopy =
    denied === "user"
      ? "User accounts cannot open the admin desk. Sign in with the admin account."
      : denied === "taken"
        ? "An admin account already exists. Sign in with that account."
        : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link to="/" className="font-display text-3xl">
        AI Video Shop
      </Link>
      <p className="mt-6 text-xs font-semibold tracking-widest text-accent">ADMIN</p>
      <h1 className="mt-3 font-display text-4xl">{mode === "up" ? "Open the admin account" : "Admin sign in"}</h1>
      <p className="mt-2 text-sm text-muted">
        Only the admin account can open this desk. A member sign-in is refused.
      </p>
      {user && role === "user" ? (
        <p className="mt-3 text-sm text-danger">You are signed in as a member. Use the admin account below to switch.</p>
      ) : null}
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        {mode === "up" ? (
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </Field>
        ) : null}
        <Field label="Admin email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </Field>
        {deniedCopy ? <p className="text-sm text-danger">{deniedCopy}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Please wait…" : mode === "up" ? "Create admin account" : "Open admin desk"}
        </Button>
      </form>
      {open && mode === "in" ? null : open ? (
        <button type="button" className="mt-4 h-11 text-sm text-muted" onClick={() => setMode("in")}>
          Admin account already exists? Sign in
        </button>
      ) : null}
      <Link to="/login" className="mt-4 inline-flex h-11 items-center text-sm text-muted">
        Member sign in
      </Link>
    </main>
  );
}

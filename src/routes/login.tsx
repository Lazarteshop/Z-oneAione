import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BootScreen } from "@/components/shell";
import { Button, Field, inputClass } from "@/components/ui";
import { errorText } from "@/lib/format";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · AI Video Shop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) return <BootScreen />;
  if (user) return <Navigate to="/" />;

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
          ? await authClient.signUp.email({ email, password, name: name.trim(), callbackURL: "/" })
          : await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) {
        setError(result.error.message ?? "Could not sign in.");
        return;
      }
      await router.invalidate();
      await router.navigate({ to: "/" });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link to="/" className="font-display text-3xl">
        AI Video Shop
      </Link>
      <h1 className="mt-6 font-display text-4xl">{mode === "up" ? "Create your wallet" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted">Members buy films, earn tokens, and request payouts. This door does not open the admin desk.</p>
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        {mode === "up" ? (
          <Field label="Name" hint="This is the name spoken in a payout film.">
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </Field>
        ) : null}
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
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
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 h-11 text-sm text-muted"
        onClick={() => {
          setMode((value) => (value === "up" ? "in" : "up"));
          setError(null);
        }}
      >
        {mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
      <Link to="/admin-login" className="mt-2 inline-flex h-11 items-center text-sm text-muted">
        Admin sign in
      </Link>
      {typeof window !== "undefined" &&
      (window.location.hostname.endsWith(".grok-sandbox.com") ||
        window.location.hostname.endsWith(".grok.me")) ? (
        <div className="mt-6 space-y-2 border-t border-line pt-6">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              className="h-11 w-full rounded-full bg-raised text-sm font-semibold"
            >
              Continue with {provider.label}
            </button>
          ))}
        </div>
      ) : null}
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { WalletView } from "@/components/wallet-view";
import { BootScreen, Shell } from "@/components/shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet · AI Video Shop" }] }),
  component: WalletPage,
});

function WalletPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <BootScreen />;
  if (!user) return <RedirectToSignIn />;
  return (
    <Shell>
      <WalletView />
    </Shell>
  );
}

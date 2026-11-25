import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/shop-view";
import { BootScreen, Shell } from "@/components/shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop · AI Video Shop" }] }),
  component: ShopPage,
});

function ShopPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <BootScreen />;
  if (!user) return <RedirectToSignIn />;
  return (
    <Shell>
      <ShopView />
    </Shell>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AdminView } from "@/components/admin-view";
import { BootScreen, Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/platform.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · AI Video Shop" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    getMe()
      .then((me) => {
        if (!cancel) setAllowed(me.role === "admin");
      })
      .catch(() => {
        if (!cancel) setAllowed(false);
      });
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  if (isPending || (user && allowed == null)) return <BootScreen />;
  if (!user) return <Navigate to="/admin-login" />;
  if (!allowed) return <Navigate to="/" />;
  return (
    <Shell>
      <AdminView />
    </Shell>
  );
}

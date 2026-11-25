import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/feed";
import { Landing } from "@/components/landing";
import { Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type FeedSearch = { v?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    v: typeof search.v === "string" && /^\d+$/.test(search.v) ? search.v : undefined,
  }),
  component: Home,
});

function Home() {
  const { user, isPending } = useCurrentUserState();
  const { v } = Route.useSearch();
  if (user) {
    return (
      <Shell>
        <Feed focusId={v} />
      </Shell>
    );
  }
  return <Landing ready={!isPending} />;
}

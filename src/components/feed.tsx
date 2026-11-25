import { useEffect, useRef, useState } from "react";
import { Eye, Heart, Pause, Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FilmVideo } from "@/components/film-video";
import { Reel } from "@/components/reel";
import { cn } from "@/lib/cn";
import { COUNT_SECONDS } from "@/lib/catalog";
import { ago, errorText } from "@/lib/format";
import { claimWatch, getFeed, startWatch, toggleLike, type ClaimResult, type FeedPost } from "@/lib/platform.functions";
import { useUi } from "@/lib/ui-store";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const claimedSessions = new Set<number>();

function reasonCopy(reason: string): string {
  switch (reason) {
    case "self":
      return "This is your film. Views from you do not pay tokens.";
    case "user_24h":
      return "You already counted a view here in the last 24 hours.";
    case "ip_24h":
      return "This network already counted a view here in the last 24 hours.";
    case "already":
      return "That view was already counted.";
    case "too_soon":
      return "Keep it playing. Five seconds have to pass.";
    default:
      return "This view was not counted.";
  }
}

function FilmCard({
  post,
  playing,
  onToggle,
  onLike,
}: {
  post: FeedPost;
  playing: boolean;
  onToggle: () => void;
  onLike: () => void;
}) {
  const me = useCurrentUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [views, setViews] = useState(post.viewCount);
  const [watched, setWatched] = useState(0);
  const mine = me?.id === post.ownerId;
  const [note, setNote] = useState<string | null>(post.counted ? reasonCopy("user_24h") : mine ? reasonCopy("self") : null);
  const [settled, setSettled] = useState(post.counted || mine);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const accrued = useRef(0);

  useEffect(() => {
    setViews((count) => Math.max(count, post.viewCount));
  }, [post.viewCount]);

  useEffect(() => {
    if (!me?.id || post.ownerId !== me.id) return;
    setSettled(true);
    setNote((current) => current ?? reasonCopy("self"));
  }, [me?.id, post.ownerId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      accrued.current += 0.2;
      setWatched(accrued.current);
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!playing || sessionId || settled) return;
    let cancel = false;
    startWatch({ data: { postId: post.id } })
      .then((res) => {
        if (cancel) return;
        if (res.eligible) setSessionId(res.sessionId);
        else {
          setNote(reasonCopy(res.reason));
          setSettled(true);
        }
      })
      .catch((err) => {
        if (!cancel) toast.error(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [playing, post.id, settled, sessionId]);

  const ready = watched >= 5.15;
  useEffect(() => {
    if (!ready || sessionId == null || settled || claimedSessions.has(sessionId)) return;
    claimedSessions.add(sessionId);
    let cancel = false;
    void (async () => {
      let res: ClaimResult | null = null;
      try {
        for (let i = 0; i < 12; i += 1) {
          res = await claimWatch({ data: { sessionId } });
          if (cancel) return;
          if (res.ok || res.reason !== "too_soon") break;
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      } catch (err) {
        claimedSessions.delete(sessionId);
        if (!cancel) toast.error(errorText(err));
        return;
      }
      if (cancel || !res) return;
      if (!res.ok && res.reason === "too_soon") {
        claimedSessions.delete(sessionId);
        return;
      }
      setSettled(true);
      if (res.ok) {
        setViews(res.viewCount);
        setNote(`Valid view. ${res.tokens} tokens paid to ${post.username}.`);
        toast.success(`${post.username} earned ${res.tokens} tokens`);
      } else {
        setNote(reasonCopy(res.reason));
      }
    })();
    return () => {
      cancel = true;
      claimedSessions.delete(sessionId);
    };
  }, [ready, sessionId, settled, post.username]);

  async function share() {
    const url = `${window.location.origin}/?v=${post.id}`;
    const payload = { title: post.title, text: `${post.title} by ${post.username}`, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      /* dismissed share sheet */
    }
  }

  const remain = Math.max(0, COUNT_SECONDS - watched);
  const progress = Math.min(100, (watched / COUNT_SECONDS) * 100);
  const initial = post.username.slice(0, 1).toUpperCase();

  return (
    <article id={`post-${post.id}`} className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <header className="flex items-center gap-3 px-4 pt-4">
        <span className="grid size-11 place-items-center rounded-full bg-raised font-semibold text-accent">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{post.username}</p>
          <p className="text-sm text-muted">
            {ago(post.createdAt)} · {post.tier}
          </p>
        </div>
        <p className="text-sm font-semibold text-accent">{post.tokensPerView}/view</p>
      </header>
      <p className="px-4 py-3">{post.title}</p>
      <div className="relative aspect-video bg-bg">
        {post.hasVideo ? (
          <FilmVideo ref={videoRef} assetId={post.assetId} playing={playing} controls={false} />
        ) : (
          <Reel tier={post.tier} playing={playing} seed={post.id} />
        )}
        <button
          type="button"
          onClick={() => {
            const el = videoRef.current;
            if (post.hasVideo && el) {
              if (playing) el.pause();
              else void el.play().catch(() => undefined);
            }
            onToggle();
          }}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0"
        >
          <span
            className={cn(
              "absolute grid size-11 place-items-center rounded-full bg-fg text-bg",
              playing ? "top-3 right-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            )}
          >
            {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-5" />}
          </span>
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-line">
          <div className="h-full bg-accent" style={{ width: `${settled ? 100 : progress}%` }} />
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-xs text-fg">
          {settled ? "View settled" : !playing ? "Play 5s to count" : watched >= 5 ? "Counting…" : `${remain.toFixed(1)}s to count`}
        </p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <p className="inline-flex items-center gap-2 tabular-nums" aria-live="polite">
          <Eye className="size-4 text-muted" />
          {views} {views === 1 ? "view" : "views"}
        </p>
        <p className="text-muted tabular-nums">{post.likeCount} {post.likeCount === 1 ? "like" : "likes"}</p>
      </div>
      <div className="grid grid-cols-2 border-t border-line">
        <button type="button" onClick={onLike} className="inline-flex h-12 items-center justify-center gap-2 text-sm">
          <Heart className={`size-4 ${post.liked ? "fill-accent text-accent" : ""}`} />
          Like
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="inline-flex h-12 items-center justify-center gap-2 border-l border-line text-sm"
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>
      {note ? <p className="px-4 py-3 text-sm text-muted">{note}</p> : null}
    </article>
  );
}

export function Feed({ focusId }: { focusId?: string }) {
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const revision = useUi((s) => s.revision);

  useEffect(() => {
    let cancel = false;
    getFeed()
      .then((rows) => {
        if (!cancel) {
          setPosts(rows);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [revision]);

  useEffect(() => {
    if (!focusId || !posts?.length) return;
    document.getElementById(`post-${focusId}`)?.scrollIntoView({ block: "center" });
  }, [focusId, posts]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      getFeed()
        .then((rows) => setPosts(rows))
        .catch(() => {
          /* keep the feed on screen if a refresh fails */
        });
    }, 12000);
    return () => window.clearInterval(timer);
  }, [revision]);

  async function like(post: FeedPost) {
    const prev = posts;
    setPosts((rows) =>
      rows?.map((row) =>
        row.id === post.id
          ? {
              ...row,
              liked: !row.liked,
              likeCount: row.likeCount + (row.liked ? -1 : 1),
            }
          : row,
      ) ?? null,
    );
    try {
      const res = await toggleLike({ data: { postId: post.id } });
      setPosts((rows) => rows?.map((row) => (row.id === post.id ? { ...row, liked: res.liked, likeCount: res.likeCount } : row)) ?? null);
    } catch (err) {
      setPosts(prev);
      toast.error(errorText(err));
    }
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,36rem)_16rem]">
      <div className="space-y-4">
        {error ? <p className="text-danger">{error}</p> : null}
        {posts == null && !error ? (
          <div className="space-y-4">
            <div className="h-80 animate-pulse rounded-2xl bg-surface" />
            <div className="h-80 animate-pulse rounded-2xl bg-surface" />
          </div>
        ) : null}
        {posts?.length === 0 ? (
          <p className="rounded-2xl bg-surface p-6 text-muted">The feed is empty. Buy a film and wait for an admin to publish it.</p>
        ) : null}
        {posts?.map((post) => (
          <FilmCard
            key={post.id}
            post={post}
            playing={activeId === post.id}
            onToggle={() => setActiveId((id) => (id === post.id ? null : post.id))}
            onLike={() => void like(post)}
          />
        ))}
      </div>
      <aside className="hidden rounded-2xl border border-line p-4 md:block md:sticky md:top-28">
        <h2 className="font-display text-2xl">What counts</h2>
        <ul className="mt-3 space-y-3 text-sm text-muted">
          <li>Play for five seconds. Pausing or leaving the tab stops the clock.</li>
          <li>Your own film never pays you.</li>
          <li>One valid view per person, and per network, every 24 hours.</li>
          <li>Starter pays 2, Pro pays 4, VIP pays 5.</li>
        </ul>
      </aside>
    </div>
  );
}

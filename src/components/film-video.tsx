import { forwardRef, useEffect, useState } from "react";
import { getBearerToken } from "@/lib/auth/client";

export const FilmVideo = forwardRef<
  HTMLVideoElement,
  { assetId: string; playing?: boolean; controls?: boolean }
>(function FilmVideo({ assetId, playing, controls = true }, ref) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      setSrc(`/api/films/${assetId}`);
      return;
    }
    let url: string | null = null;
    let cancel = false;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    fetch(`/api/films/${assetId}`, { headers, credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("missing");
        return res.blob();
      })
      .then((blob) => {
        if (cancel) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => {
        if (!cancel) setFailed(true);
      });
    return () => {
      cancel = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [assetId]);

  useEffect(() => {
    const el = typeof ref === "object" && ref ? ref.current : null;
    if (!el || playing == null || !src) return;
    if (playing) void el.play().catch(() => undefined);
    else el.pause();
  }, [playing, src, ref]);

  if (failed) return <p className="grid size-full place-items-center px-4 text-center text-sm text-muted">Video unavailable.</p>;
  if (!src) return <div className="size-full animate-pulse bg-raised" />;
  return (
    <video
      ref={ref}
      src={src}
      className="size-full bg-bg object-cover"
      controls={controls}
      playsInline
      preload="metadata"
    />
  );
});

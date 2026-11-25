import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId } from "@/lib/auth/verify.server";
import { createExclusiveFilm, MAX_VIDEO_BYTES } from "@/lib/shop-video.server";

function bearerOf(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  const match = header ? /^Bearer\s+(.+)$/i.exec(header) : null;
  return match?.[1];
}

function videoMime(file: File): string | null {
  if (file.type.startsWith("video/")) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webm")) return "video/webm";
  return null;
}

export const Route = createFileRoute("/api/films/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
          const userId = await requireUserId(bearerOf(request));
          const form = await request.formData();
          const file = form.get("video");
          if (!(file instanceof File)) {
            return Response.json({ error: "Choose a video from your gallery." }, { status: 400 });
          }
          if (file.size > MAX_VIDEO_BYTES) {
            return Response.json({ error: "Use a video under 25 MB." }, { status: 400 });
          }
          const mime = videoMime(file);
          if (!mime) {
            return Response.json({ error: "Choose a video from your gallery. MP4, MOV, or WebM." }, { status: 400 });
          }
          const tierRaw = String(form.get("tier") ?? "starter");
          const tier = tierRaw === "pro" || tierRaw === "vip" ? tierRaw : "starter";
          const pricePhp = Number(form.get("pricePhp"));
          const tokensPerView = Number(form.get("tokensPerView"));
          const bytes = new Uint8Array(await file.arrayBuffer());
          const saved = await createExclusiveFilm({
            userId,
            title: String(form.get("title") ?? ""),
            description: String(form.get("description") ?? ""),
            pricePhp,
            tokensPerView,
            tier,
            mime,
            bytes,
          });
          return Response.json(saved);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not save that video.";
          const status = message === "Unauthorized" ? 401 : message === "Admin only." ? 403 : message.includes("cross-site") ? 403 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});

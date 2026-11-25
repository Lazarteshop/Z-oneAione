import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId } from "@/lib/auth/verify.server";
import { readShopVideo } from "@/lib/shop-video.server";

function bearerOf(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  const match = header ? /^Bearer\s+(.+)$/i.exec(header) : null;
  return match?.[1];
}

export const Route = createFileRoute("/api/films/$assetId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          assertSameSiteRequest();
          await requireUserId(bearerOf(request));
          const video = await readShopVideo(params.assetId);
          if (!video) return new Response("Not found", { status: 404 });
          const body = new Uint8Array(video.bytes.byteLength);
          body.set(video.bytes);
          return new Response(body, {
            headers: {
              "content-type": video.mime,
              "content-length": String(body.byteLength),
              "cache-control": "private, max-age=3600",
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unauthorized";
          const status = message === "Unauthorized" ? 401 : 403;
          return new Response(message, { status });
        }
      },
    },
  },
});

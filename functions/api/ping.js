export function onRequestGet() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "Server-Timing": "edge;desc=\"Cloudflare Pages Function\""
    }
  });
}

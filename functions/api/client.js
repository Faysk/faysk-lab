export async function onRequest({ request }) {
  const headers = request.headers;
  const cf = request.cf || {};
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const ip = headers.get("cf-connecting-ip") || forwardedFor.split(",")[0] || null;

  return Response.json({
    source: "cloudflare-pages-function",
    ip,
    city: cf.city || null,
    region: cf.region || cf.regionCode || null,
    country: cf.country || headers.get("cf-ipcountry") || null,
    colo: cf.colo || null,
    timezone: cf.timezone || null,
    asn: cf.asn || null,
    org: cf.asOrganization || null,
    latitude: cf.latitude || null,
    longitude: cf.longitude || null
  }, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

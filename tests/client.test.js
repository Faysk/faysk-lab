import test from "node:test";
import assert from "node:assert/strict";

import { onRequest } from "../functions/api/client.js";

test("client function returns first-party Cloudflare metadata without caching", async () => {
  const request = new Request("https://lab.faysk.dev/api/client", {
    headers: {
      "cf-connecting-ip": "203.0.113.8",
      "cf-ipcountry": "GB"
    }
  });
  Object.defineProperty(request, "cf", {
    value: {
      city: "London",
      region: "England",
      colo: "LHR",
      timezone: "Europe/London",
      asn: 64500,
      asOrganization: "Example Network"
    }
  });

  const response = await onRequest({ request });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(body, {
    source: "cloudflare-pages-function",
    ip: "203.0.113.8",
    city: "London",
    region: "England",
    country: "GB",
    colo: "LHR",
    timezone: "Europe/London",
    asn: 64500,
    org: "Example Network"
  });
});

import test from "node:test";
import assert from "node:assert/strict";

import { onRequestGet } from "../functions/api/ping.js";

test("ping function returns a cache-free empty response", () => {
  const response = onRequestGet();

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("server-timing"), /Cloudflare Pages Function/);
});

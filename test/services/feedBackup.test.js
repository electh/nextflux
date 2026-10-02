import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Exercise the resource functions with a recording HTTP client, without a server.
const clientUrl =
  "data:text/javascript," +
  encodeURIComponent(`
  export const requests = [];
  export const apiClient = {
    async get(...args) { requests.push(['GET', ...args]); return { data: '<opml version="2.0" />' }; },
    async post(...args) { requests.push(['POST', ...args]); return { data: { message: 'Feeds imported successfully' } }; }
  };
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/api/client.js")
      return { url: clientUrl, shortCircuit: true };
    if (specifier === "@/lib/errors.js")
      return {
        url: "data:text/javascript,export const reportError = e => e",
        shortCircuit: true,
      };
    return nextResolve(specifier, context);
  },
});
const { exportOPML, importOPML } =
  await import("../../src/api/resources/feeds.js");
const { requests } = await import(clientUrl);
hooks.deregister();

test("OPML export requests the authenticated server export as XML text", async () => {
  requests.length = 0;
  assert.equal(await exportOPML(), '<opml version="2.0" />');
  assert.deepEqual(requests, [["GET", "/v1/export", { responseType: "text" }]]);
});

test("an exported OPML file can be imported as a raw XML body rather than multipart", async () => {
  requests.length = 0;
  const xml = '<opml version="2.0"><body><outline text="中文" /></body></opml>';
  const result = await importOPML(new Blob([xml], { type: "application/xml" }));
  assert.deepEqual(result, { message: "Feeds imported successfully" });
  assert.deepEqual(requests, [
    [
      "POST",
      "/v1/import",
      xml,
      { headers: { "Content-Type": "application/xml" } },
    ],
  ]);
});

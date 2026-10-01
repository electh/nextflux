import test from "node:test";
import assert from "node:assert/strict";
import { createIconLoader } from "../../src/services/iconLoaderFactory.js";

test("simultaneous cards share one favicon request and missing icons are cached", async () => {
  const cache = new Map();
  let requests = 0;
  const now = Date.parse("2026-09-30T00:00:00Z");
  const loader = createIconLoader({
    get: async (id) => cache.get(id),
    put: async (value) =>
      cache.set(value.feedId, {
        ...value,
        updated_at: new Date(now).toISOString(),
      }),
    fetchIcon: async () => {
      requests++;
      return null;
    },
    now: () => now,
  });
  assert.equal(loader.load(1), loader.load(1));
  assert.deepEqual(await Promise.all([loader.load(1), loader.load(1)]), [
    null,
    null,
  ]);
  assert.equal(requests, 1);
  await loader.load(1);
  assert.equal(requests, 1);
});

test("expired icons refresh once and transient failures preserve cached data", async () => {
  const cached = { feedId: 1, data: "old", updated_at: "2026-09-01T00:00:00Z" };
  let writes = 0;
  const loader = createIconLoader({
    get: async () => cached,
    put: async () => {
      writes++;
    },
    fetchIcon: async () => undefined,
    now: () => Date.parse("2026-09-30T00:00:00Z"),
  });
  assert.equal(await loader.load(1), cached);
  assert.equal(writes, 0);
});

test("logout invalidation prevents pending icon responses from writing storage", async () => {
  let release;
  let writes = 0;
  const loader = createIconLoader({
    get: async () => null,
    put: async () => {
      writes++;
    },
    fetchIcon: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  const request = loader.load(1);
  await Promise.resolve();
  loader.clear();
  release({ data: "icon" });
  assert.equal(await request, null);
  assert.equal(writes, 0);
});

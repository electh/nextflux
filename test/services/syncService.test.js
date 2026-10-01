import test from "node:test";
import assert from "node:assert/strict";
import { createSyncService } from "../../src/services/syncServiceFactory.js";

function fixture({ entries = [], lastSync = null, cap = Infinity, now } = {}) {
  const stored = new Map();
  const calls = [];
  let bootstrap = null;
  let historyComplete = Boolean(lastSync);
  const repository = {
    reconcileFeeds: async () => false,
    isHistorySyncComplete: () => historyComplete,
    setHistorySyncComplete: () => {
      historyComplete = true;
    },
    mergeArticles: async (articles) => {
      const changed = articles.filter(
        (article) =>
          JSON.stringify(stored.get(article.id)) !== JSON.stringify(article),
      );
      changed.forEach((article) => stored.set(article.id, article));
      return changed;
    },
    getLastSyncTime: () => lastSync,
    setLastSyncTime: (time) => {
      lastSync = time;
    },
    getSyncBootstrap: () => bootstrap,
    setSyncBootstrap: (state) => {
      bootstrap = state ? structuredClone(state) : null;
    },
  };
  const api = {
    getFeeds: async () => [],
    getCategories: async () => [],
    getEntriesPage: async (params) => {
      calls.push(params);
      const requestedStatuses = Array.isArray(params.status)
        ? params.status
        : [params.status];
      if (
        requestedStatuses.some(
          (status) => status !== "read" && status !== "unread",
        )
      ) {
        throw new Error(
          'invalid entry status, valid status values are: "read" and "unread"',
        );
      }
      let selected = entries.filter(
        ({ id }) => !params.before_entry_id || id < params.before_entry_id,
      );
      if (params.changed_after !== undefined) {
        selected = selected.filter(
          (entry) => Date.parse(entry.changed_at) / 1000 > params.changed_after,
        );
      }
      const statuses = Array.isArray(params.status)
        ? params.status
        : [params.status];
      selected = selected.filter((entry) => statuses.includes(entry.status));
      return {
        entries: selected
          .sort((a, b) => b.id - a.id)
          .slice(0, Math.min(cap, params.limit)),
      };
    },
  };
  const service = createSyncService({
    api,
    repository,
    mapEntry: (entry) => entry,
    now,
    firstPageSize: 2,
    batchSize: 4,
    yieldToUI: async () => {},
  });
  return {
    service,
    api,
    repository,
    calls,
    stored,
    get lastSync() {
      return lastSync;
    },
  };
}
const entry = (id, status = "unread", extra = {}) => ({
  id,
  status,
  changed_at: "2026-09-29T00:00:00Z",
  ...extra,
});

test("publishes the first small batch before background completion", async () => {
  const started = new Date("2026-09-30T00:00:00Z");
  const f = fixture({
    entries: [
      entry(1),
      entry(2),
      entry(3),
      entry(4, "read", { starred: true }),
    ],
    now: () => started,
  });
  const batches = [];
  await f.service.synchronize({
    onBatch: ({ articles }) => {
      batches.push(articles.map(({ id }) => id));
      assert.equal(f.lastSync, null);
    },
  });
  assert.deepEqual(batches, [
    [4, 3],
    [2, 1],
  ]);
  assert.equal(f.calls[0].limit, 2);
  assert.equal(f.lastSync, started);
  assert.deepEqual([...f.stored.keys()].sort(), [1, 2, 3, 4]);
});

test("continues through server-capped short pages and uses ID cursors", async () => {
  const f = fixture({
    entries: Array.from({ length: 9 }, (_, i) => entry(i + 1)),
    cap: 2,
  });
  await f.service.synchronize();
  assert.equal(f.stored.size, 9);
  assert.deepEqual(
    f.calls
      .filter((p) => p.changed_after === undefined)
      .map((p) => p.before_entry_id),
    [undefined, 8, 6, 4, 2, 1],
  );
  assert.ok(
    f.calls.every((params) => params.limit > 0 && params.offset === undefined),
  );
});

test("incremental sync requests supported statuses and includes backdated entries", async () => {
  const previous = new Date("2026-09-29T00:00:00.900Z");
  const f = fixture({
    lastSync: previous,
    entries: [
      entry(10, "removed", { changed_at: "2026-09-29T00:00:01Z" }),
      entry(11, "unread", {
        changed_at: "2026-09-29T00:00:02Z",
        published_at: "2000-01-01T00:00:00Z",
      }),
      entry(12, "read", { changed_at: "2026-09-29T00:00:00Z" }),
    ],
  });
  await f.service.syncEntries();
  assert.equal(
    f.calls[0].changed_after,
    Math.floor(previous.getTime() / 1000) - 2,
  );
  assert.deepEqual(f.calls[0].status, ["read", "unread"]);
  assert.equal(f.stored.size, 2);
  assert.equal(f.stored.has(10), false);
  assert.ok(f.calls.every((params) => params.after === undefined));
});

test("a failed bootstrap resumes after the committed cursor without advancing the watermark", async () => {
  const f = fixture({ entries: [entry(1), entry(2), entry(3), entry(4)] });
  const original = f.api.getEntriesPage;
  f.api.getEntriesPage = async (params) => {
    if (params.before_entry_id === 3) throw new Error("offline");
    return original(params);
  };
  await assert.rejects(f.service.synchronize(), /offline/);
  assert.equal(f.lastSync, null);
  assert.equal(f.repository.getSyncBootstrap().entries.beforeId, 3);
  f.calls.length = 0;
  f.api.getEntriesPage = original;
  await f.service.synchronize();
  assert.equal(f.calls[0].before_entry_id, 3);
  assert.equal(f.stored.size, 4);
  assert.equal(f.repository.getSyncBootstrap(), null);
});

test("bootstrap catch-up captures state changes before a resumed run started", async () => {
  const f = fixture({
    entries: [entry(1, "read", { changed_at: "2026-09-29T01:00:00Z" })],
    now: () => new Date("2026-09-30T00:00:00Z"),
  });
  f.repository.setSyncBootstrap({
    startedAt: "2026-09-29T00:00:00Z",
    entries: { done: true },
  });
  await f.service.synchronize();
  assert.equal(f.stored.get(1).status, "read");
});

test("concurrent callers share one run and unchanged batches do not notify", async () => {
  const f = fixture({
    lastSync: new Date("2026-09-29T00:00:00Z"),
    entries: [entry(1)],
  });
  f.stored.set(1, entry(1));
  let notifications = 0;
  const first = f.service.synchronize({
    onBatch: () => {
      notifications++;
    },
  });
  const second = f.service.synchronize();
  assert.equal(first, second);
  await first;
  assert.equal(notifications, 0);
});

test("aborted responses are never committed", async () => {
  const f = fixture({ entries: [entry(1)] });
  const controller = new AbortController();
  f.api.getEntriesPage = async () => {
    controller.abort();
    return { entries: [entry(1)] };
  };
  await assert.rejects(f.service.synchronize({ signal: controller.signal }), {
    name: "AbortError",
  });
  assert.equal(f.stored.size, 0);
  assert.equal(f.lastSync, null);
});

test("a server that ignores the cursor fails instead of looping forever", async () => {
  const f = fixture();
  f.api.getEntriesPage = async () => ({ entries: [entry(1)] });
  await assert.rejects(f.service.synchronize(), /cursor did not advance/);
  assert.equal(f.lastSync, null);
});

test("uses an exact total to avoid requesting an unnecessary empty final page", async () => {
  const f = fixture({
    lastSync: new Date("2026-09-29T00:00:00Z"),
    entries: [entry(1)],
  });
  const original = f.api.getEntriesPage;
  f.api.getEntriesPage = async (params) => ({
    ...(await original(params)),
    total: 1,
  });
  await f.service.synchronize();
  assert.equal(f.calls.length, 1);
});

test("bootstrap includes unstarred read history and excludes removed entries", async () => {
  const f = fixture({
    entries: [entry(1, "read"), entry(2), entry(3, "removed")],
    now: () => new Date("2026-09-30T00:00:00Z"),
  });
  await f.service.synchronize();
  assert.deepEqual([...f.stored.keys()].sort(), [1, 2]);
  assert.equal(f.repository.isHistorySyncComplete(), true);
});

test("an existing incremental watermark still backfills history once", async () => {
  const f = fixture({
    lastSync: new Date("2026-09-29T23:00:00Z"),
    entries: [entry(1, "read"), entry(2)],
  });
  f.repository.isHistorySyncComplete = () => false;
  await f.service.synchronize();
  assert.deepEqual(f.calls[0].status, ["read", "unread"]);
  assert.equal(f.calls[0].changed_after, undefined);
  assert.equal(f.stored.get(1).status, "read");
});

test("migrates an interrupted unread-only bootstrap without losing its catch-up boundary", async () => {
  const f = fixture({
    entries: [entry(1, "read")],
    now: () => new Date("2026-09-30T00:00:00Z"),
  });
  f.repository.setSyncBootstrap({
    startedAt: "2026-09-29T00:00:00Z",
    unread: { done: true },
    starred: { done: true },
  });
  await f.service.synchronize();
  assert.equal(f.stored.get(1).status, "read");
  assert.equal(
    f.calls.find((p) => p.changed_after !== undefined).changed_after,
    Date.parse("2026-09-29T00:00:00Z") / 1000 - 2,
  );
});

test("bootstrap catch-up and later sync succeed against servers rejecting removed filters", async () => {
  const f = fixture({
    entries: [entry(1, "read"), entry(2)],
    now: () => new Date("2026-09-30T00:00:00Z"),
  });
  await f.service.synchronize();
  await f.service.synchronize();
  assert.ok(
    f.calls.every(({ status }) =>
      status.every((value) => value === "read" || value === "unread"),
    ),
  );
  assert.equal(f.stored.size, 2);
});

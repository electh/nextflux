import test from "node:test";
import assert from "node:assert/strict";
import { createOutboxService } from "../../src/services/outboxServiceFactory.js";
import {
  acknowledgeChanges,
  mergePendingArticle,
} from "../../src/domain/articles/offlineChanges.js";

function fixture() {
  const stored = new Map([
    [
      1,
      {
        id: 1,
        status: "read",
        starred: 1,
        pendingChanges: {
          status: { value: "read", token: "s1" },
          starred: { value: 1, token: "b1" },
        },
      },
    ],
  ]);
  const calls = [];
  const repository = {
    getPendingArticles: async () =>
      structuredClone(
        [...stored.values()].filter(
          (a) => Object.keys(a.pendingChanges).length,
        ),
      ),
    acknowledgeArticleChanges: async (id, sent) => {
      const article = stored.get(id);
      article.pendingChanges = acknowledgeChanges(article, sent);
    },
  };
  const api = {
    updateEntries: async (ids, changes) => calls.push({ ids, changes }),
  };
  return { stored, calls, repository, api };
}

test("replays read and star desired values once, clearing only acknowledged changes", async () => {
  const f = fixture();
  const flush = createOutboxService(f);
  await flush();
  await flush();
  assert.deepEqual(f.calls, [
    { ids: [1], changes: { starred: true, status: "read" } },
  ]);
  assert.deepEqual(f.stored.get(1).pendingChanges, {});
});

test("a lost network response keeps durable edits for an idempotent retry", async () => {
  const f = fixture();
  let fail = true;
  f.api.updateEntries = async (ids, changes) => {
    f.calls.push({ ids, changes });
    if (fail) throw new Error("network lost");
  };
  const flush = createOutboxService(f);
  await assert.rejects(flush(), /network lost/);
  assert.equal(Object.keys(f.stored.get(1).pendingChanges).length, 2);
  fail = false;
  await flush();
  assert.deepEqual(f.calls[0], f.calls[1]);
  assert.deepEqual(f.stored.get(1).pendingChanges, {});
});

test("an acknowledgement cannot clear a newer edit made during the request", async () => {
  const f = fixture();
  f.api.updateEntries = async () => {
    f.stored.get(1).pendingChanges.status = { value: "unread", token: "s2" };
    f.stored.get(1).status = "unread";
  };
  await createOutboxService(f)();
  assert.deepEqual(f.stored.get(1).pendingChanges, {
    status: { value: "unread", token: "s2" },
  });
  assert.equal(f.stored.get(1).status, "unread");
});

test("server pulls preserve pending fields without discarding fresh article content", () => {
  const local = fixture().stored.get(1);
  const merged = mergePendingArticle(
    { id: 1, status: "unread", starred: 0, content: "updated text" },
    local,
  );
  assert.equal(merged.status, "read");
  assert.equal(merged.starred, 1);
  assert.equal(merged.content, "updated text");
  assert.deepEqual(merged.pendingChanges, local.pendingChanges);
  assert.equal(
    mergePendingArticle({ id: 1, status: "removed" }, local).status,
    "read",
  );
});

test("cancelled logout/account switches never acknowledge or send the next batch", async () => {
  const f = fixture();
  const controller = new AbortController();
  f.api.updateEntries = async () => controller.abort();
  await assert.rejects(createOutboxService(f)({ signal: controller.signal }), {
    name: "AbortError",
  });
  assert.equal(Object.keys(f.stored.get(1).pendingChanges).length, 2);
});

test("bulk mark-read queues are sent in bounded batches", async () => {
  const f = fixture();
  f.stored.clear();
  for (let id = 1; id <= 205; id++)
    f.stored.set(id, {
      id,
      pendingChanges: { status: { value: "read", token: String(id) } },
    });
  await createOutboxService(f)();
  assert.deepEqual(
    f.calls.map((c) => c.ids.length),
    [100, 100, 5],
  );
  assert.ok(
    [...f.stored.values()].every((a) => !Object.keys(a.pendingChanges).length),
  );
});

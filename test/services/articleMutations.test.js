import test from "node:test";
import assert from "node:assert/strict";
import { createArticleMutations } from "../../src/services/articleMutations.js";

test("rapid clicks publish one optimistic update and one write until completion", async () => {
  let finish;
  let writes = 0;
  let pending;
  const patches = [];
  const mutate = createArticleMutations({
    patch: (id, changes) => patches.push({ id, changes }),
    onPending: (value) => {
      pending = value;
    },
  });
  const article = { id: 1, status: "read" };
  const persist = () => {
    writes++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const first = mutate(article, "status", "unread", persist);
  assert.deepEqual(pending, { "1:status": "unread" });
  assert.equal(await mutate(article, "status", "unread", persist), false);
  assert.equal(writes, 1);
  assert.deepEqual(patches, [{ id: 1, changes: { status: "unread" } }]);
  finish();
  assert.equal(await first, true);
  assert.deepEqual(pending, {});
  assert.equal(
    await mutate(
      { ...article, status: "unread" },
      "status",
      "read",
      async () => {},
    ),
    true,
  );
});

test("failure rolls back only its field; other fields and articles remain independent", async () => {
  const records = new Map([
    [1, { status: "read", starred: 0 }],
    [2, { starred: 0 }],
  ]);
  let pending;
  let fail;
  const mutate = createArticleMutations({
    patch: (id, changes) => records.set(id, { ...records.get(id), ...changes }),
    onPending: (value) => {
      pending = value;
    },
  });
  const article = { id: 1, ...records.get(1) };
  const first = mutate(
    article,
    "status",
    "unread",
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  await mutate(article, "starred", 1, async () => {});
  await mutate({ id: 2, starred: 0 }, "starred", 1, async () => {});
  fail(new Error("failed"));
  await assert.rejects(first, /failed/);
  assert.deepEqual(records.get(1), { status: "read", starred: 1 });
  assert.deepEqual(records.get(2), { starred: 1 });
  assert.deepEqual(pending, {});
  await mutate(article, "status", "unread", async () => {});
  assert.equal(records.get(1).status, "unread");
});

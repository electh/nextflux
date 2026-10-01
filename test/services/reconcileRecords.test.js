import test from "node:test";
import assert from "node:assert/strict";
import {
  reconcileRecords,
  changedRecords,
} from "../../src/domain/sync/reconcileRecords.js";

test("identical database snapshots retain the array and row identities", () => {
  const previous = [
    { id: 1, content: "body", enclosures: [] },
    { id: 2, title: "B" },
  ];
  assert.equal(reconcileRecords(previous, structuredClone(previous)), previous);
  const next = reconcileRecords(previous, [
    { ...previous[0], content: "updated" },
    { ...previous[1] },
  ]);
  assert.notEqual(next[0], previous[0]);
  assert.equal(next[1], previous[1]);
});

test("record comparison ignores object property order and detects nested changes", () => {
  const previous = [{ id: 1, feed: { title: "A", id: 3 } }];
  assert.deepEqual(
    changedRecords(previous, [{ feed: { id: 3, title: "A" }, id: 1 }]),
    [],
  );
  assert.equal(
    changedRecords(previous, [{ id: 1, feed: { id: 3, title: "B" } }]).length,
    1,
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { createReadingLayoutStorage } from "../../src/lib/readingLayoutStorage.js";

test("reading layouts survive a new storage adapter and keep panel combinations separate", () => {
  const values = new Map();
  const getStorage = () => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  const storage = createReadingLayoutStorage(getStorage);
  const expanded = JSON.stringify({ feeds: 20, articles: 30, reader: 50 });
  const collapsed = JSON.stringify({ articles: 35, reader: 65 });
  storage.setItem("three-columns", expanded);
  storage.setItem("two-columns", collapsed);
  const restored = createReadingLayoutStorage(getStorage);
  assert.equal(restored.getItem("three-columns"), expanded);
  assert.equal(restored.getItem("two-columns"), collapsed);
  assert.equal(restored.getItem("missing"), null);
});

test("malformed stored layouts fall back instead of crashing the persistence hook", () => {
  for (const value of [
    "{",
    "null",
    "{}",
    "[]",
    '{"articles":"30"}',
    '{"articles":-1}',
    '{"articles":101}',
    '{"articles":1e999}',
  ]) {
    const storage = createReadingLayoutStorage(() => ({
      getItem: () => value,
    }));
    assert.equal(storage.getItem("layout"), null, value);
  }
});

test("unavailable browser storage does not interrupt reading or resizing", () => {
  const storage = createReadingLayoutStorage(() => {
    throw new Error("Storage blocked");
  });
  assert.equal(storage.getItem("layout"), null);
  assert.doesNotThrow(() => storage.setItem("layout", "{}"));
  const fullStorage = createReadingLayoutStorage(() => ({
    setItem() {
      throw new Error("Quota exceeded");
    },
  }));
  assert.doesNotThrow(() => fullStorage.setItem("layout", "{}"));
});

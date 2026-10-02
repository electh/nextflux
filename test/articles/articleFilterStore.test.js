import test from "node:test";
import assert from "node:assert/strict";
import { settingsState } from "../../src/stores/settingsStore.js";

const storeUrl = "../../src/stores/articleFilterStore.js";

test("default unread is applied on initialization, not when returning to the list", async () => {
  const original = settingsState.get();
  try {
    settingsState.set({ ...original, showUnreadByDefault: true });
    const moduleUrl = `${storeUrl}?default-unread`;
    const { filter } = await import(moduleUrl);
    assert.equal(filter.get(), "unread");

    for (const selection of ["all", "starred"]) {
      filter.set(selection);
      // Route components share the same store when opening and closing an article.
      const remounted = await import(moduleUrl);
      assert.equal(remounted.filter, filter);
      assert.equal(remounted.filter.get(), selection);
      settingsState.set({ ...settingsState.get(), fontSize: 18 });
      assert.equal(filter.get(), selection);
    }
  } finally {
    settingsState.set(original);
  }
});

test("without default unread, a fresh page starts with all", async () => {
  const original = settingsState.get();
  try {
    settingsState.set({ ...original, showUnreadByDefault: false });
    const { filter } = await import(`${storeUrl}?default-all`);
    assert.equal(filter.get(), "all");
    settingsState.set({ ...original, showUnreadByDefault: true });
    assert.equal(filter.get(), "all");
  } finally {
    settingsState.set(original);
  }
});

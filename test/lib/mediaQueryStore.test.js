import test from "node:test";
import assert from "node:assert/strict";
import { createMediaQueryStore } from "../../src/lib/mediaQueryStore.js";

test("consumers share a query listener and release it after the last unmount", () => {
  const events = new EventTarget();
  let attached = 0;
  let detached = 0;
  let queries = 0;
  const media = {
    matches: false,
    addEventListener(type, listener) {
      attached += 1;
      events.addEventListener(type, listener);
    },
    removeEventListener(type, listener) {
      detached += 1;
      events.removeEventListener(type, listener);
    },
  };
  const store = createMediaQueryStore("(width < 768px)", (query) => {
    assert.equal(query, "(width < 768px)");
    queries += 1;
    return media;
  });
  let first = 0;
  let second = 0;
  const unsubscribeFirst = store.subscribe(() => first++);
  const unsubscribeSecond = store.subscribe(() => second++);
  assert.equal(attached, 1);
  assert.equal(queries, 1);
  media.matches = true;
  events.dispatchEvent(new Event("change"));
  assert.equal(store.getSnapshot(), true);
  assert.deepEqual([first, second], [1, 1]);
  unsubscribeFirst();
  assert.equal(detached, 0);
  events.dispatchEvent(new Event("change"));
  assert.deepEqual([first, second], [1, 2]);
  unsubscribeSecond();
  assert.equal(detached, 1);
  // Changes while unmounted must be reflected on the next mount.
  media.matches = false;
  const unsubscribeAgain = store.subscribe(() => first++);
  assert.equal(store.getSnapshot(), false);
  assert.equal(attached, 2);
  assert.equal(queries, 1);
  unsubscribeAgain();
});

test("server rendering does not access browser APIs", () => {
  const store = createMediaQueryStore("(width < 768px)", () => {
    throw new Error("No browser during SSR");
  });
  assert.equal(store.getServerSnapshot(), false);
});

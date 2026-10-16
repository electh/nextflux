import test from "node:test";
import assert from "node:assert/strict";
import { deleteAccountDatabase } from "../../src/services/accountCleanup.js";

test("a database deletion with no browser callback times out rather than hanging logout", async () => {
  globalThis.indexedDB = { deleteDatabase: () => ({}) };
  await assert.rejects(deleteAccountDatabase("fixture", 5), /timed out/);
});

test("a synchronous IndexedDB failure is returned as a rejected promise", async () => {
  globalThis.indexedDB = {
    deleteDatabase() {
      throw new Error("IDB unavailable");
    },
  };
  await assert.rejects(deleteAccountDatabase("fixture"), /IDB unavailable/);
});

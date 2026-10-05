import test from "node:test";
import assert from "node:assert/strict";
import { setPersistentEngine } from "@nanostores/persistent";
import { accountStorageKey } from "../../src/domain/auth/accounts.js";

let fixtureId = 0;
async function fixture(values = {}) {
  const storage = { ...values };
  const localStorage = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => {
      storage[key] = String(value);
    },
    removeItem: (key) => {
      delete storage[key];
    },
  };
  const events = new EventTarget();
  const locations = [];
  const deletedDatabases = [];
  globalThis.localStorage = localStorage;
  globalThis.window = {
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    location: { replace: (path) => locations.push(path) },
  };
  globalThis.indexedDB = {
    deleteDatabase: (name) => {
      deletedDatabases.push(name);
    },
  };
  setPersistentEngine(storage, {
    addEventListener: (_key, listener) =>
      events.addEventListener("storage", listener),
    removeEventListener: (_key, listener) =>
      events.removeEventListener("storage", listener),
  });
  const store = await import(
    `../../src/stores/authStore.js?fixture=${++fixtureId}`
  );
  return { ...store, storage, events, locations, deletedDatabases };
}
const auth = {
  serverUrl: "https://rss.example",
  username: "alice",
  password: "secret",
  userId: 1,
  authType: "basic",
};

test("migrates and persists an existing login without reloading or exposing duplicate legacy credentials", async () => {
  const f = await fixture({
    auth: JSON.stringify(auth),
    settings: "preferences",
    lastSyncTime: "timestamp",
  });
  assert.equal(f.authState.get().username, "alice");
  assert.equal(f.sessionAccount.databaseName, "minifluxReader");
  assert.equal(f.accountsState.get().accounts.length, 1);
  assert.equal(f.storage.auth, undefined);
  assert.equal(f.storage.lastSyncTime, "timestamp");
  assert.equal(f.storage.settings, "preferences");
  assert.deepEqual(f.locations, []);
});

test("login validates credentials, saves an additional account and reloads into its isolated session", async () => {
  const f = await fixture({ auth: JSON.stringify(auth) });
  let stopped = false;
  f.events.addEventListener("nextflux:logout", () => {
    stopped = true;
  });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://rss.example/v1/me");
    assert.deepEqual(options.headers, { "X-Auth-Token": "bob-token" });
    return { ok: true, json: async () => ({ id: 2, username: "bob" }) };
  };
  await f.login("https://rss.example/v1/", "", "", "bob-token");
  assert.equal(f.accountsState.get().accounts.length, 2);
  assert.equal(f.authState.get().username, "bob");
  assert.equal(f.authState.get().password, "");
  assert.equal(f.sessionAccount.username, "alice");
  assert.equal(stopped, true);
  assert.deepEqual(f.locations, ["/"]);
});

test("failed login leaves all saved accounts and the current session intact", async () => {
  const f = await fixture({ auth: JSON.stringify(auth) });
  const before = f.storage["accounts:v1"];
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    statusText: "Unauthorized",
  });
  const originalError = console.error;
  console.error = () => {};
  try {
    await assert.rejects(
      f.login("https://rss.example", "bob", "wrong", ""),
      /Unauthorized/,
    );
  } finally {
    console.error = originalError;
  }
  assert.equal(f.storage["accounts:v1"], before);
  assert.deepEqual(f.locations, []);
});

test("switching ignores unknown IDs and handles account changes from another tab", async () => {
  const f = await fixture({ auth: JSON.stringify(auth) });
  f.switchAccount("unknown");
  assert.deepEqual(f.locations, []);
  const event = new Event("storage");
  Object.assign(event, {
    key: "accounts:v1",
    newValue: JSON.stringify({ accounts: [], activeAccountId: null }),
  });
  f.events.dispatchEvent(event);
  assert.deepEqual(f.locations, ["/login"]);
});

test("logout deletes only the active account cache and sync metadata", async () => {
  const f = await fixture({
    auth: JSON.stringify(auth),
    settings: "preferences",
  });
  const active = f.authState.get();
  f.storage[accountStorageKey(active, "lastSyncTime")] = "timestamp";
  await f.logout();
  assert.deepEqual(f.deletedDatabases, ["minifluxReader"]);
  assert.equal(f.storage.lastSyncTime, undefined);
  assert.equal(f.storage.settings, "preferences");
  assert.equal(f.accountsState.get().accounts.length, 0);
  assert.deepEqual(f.locations, ["/login"]);
});

test("logging into the current account again returns home without adding a duplicate", async () => {
  const f = await fixture({ auth: JSON.stringify({ ...auth, token: "" }) });
  globalThis.fetch = async (_url, options) => {
    assert.equal(
      options.headers.Authorization,
      `Basic ${btoa("alice:secret")}`,
    );
    return { ok: true, json: async () => ({ id: 1, username: "alice" }) };
  };
  await f.login(auth.serverUrl, auth.username, auth.password, "");
  assert.equal(f.accountsState.get().accounts.length, 1);
  assert.equal(f.authState.get().databaseName, "minifluxReader");
  assert.deepEqual(f.locations, ["/"]);
});

test("logout leaves other accounts' credentials and caches intact", async () => {
  const initial = await fixture({ auth: JSON.stringify(auth) });
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ id: 2, username: "bob" }),
  });
  await initial.login(auth.serverUrl, "", "", "bob-token");
  const f = await fixture({
    "accounts:v1": initial.storage["accounts:v1"],
    lastSyncTime: "alice-timestamp",
    settings: "preferences",
  });
  const active = f.authState.get();
  f.storage[accountStorageKey(active, "lastSyncTime")] = "bob-timestamp";
  await f.logout();
  assert.equal(f.accountsState.get().accounts.length, 1);
  assert.equal(f.authState.get().username, "alice");
  assert.equal(f.authState.get().password, "secret");
  assert.equal(f.storage.lastSyncTime, "alice-timestamp");
  assert.equal(f.storage[accountStorageKey(active, "lastSyncTime")], undefined);
  assert.deepEqual(f.deletedDatabases, [active.databaseName]);
  assert.deepEqual(f.locations, ["/"]);
});

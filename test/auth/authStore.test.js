import test from "node:test";
import assert from "node:assert/strict";
import { setPersistentEngine } from "@nanostores/persistent";
import {
  accountStorageKey,
  emptyAccounts,
  saveAccount,
} from "../../src/domain/auth/accounts.js";
import { LOGOUT_NOTICE_KEY } from "../../src/services/accountCleanup.js";

let fixtureId = 0;
async function fixture(
  values = {},
  { deleteMode = "success", failRemoveKey } = {},
) {
  const storage = { ...values };
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: {
      value: (key, value) => {
        storage[key] = String(value);
      },
    },
    removeItem: {
      value: (key) => {
        if (key === failRemoveKey) throw new Error("Storage cleanup failed");
        delete storage[key];
      },
    },
  });
  const localStorage = storage;
  let rejectAccountWrites = false;
  const engine = new Proxy(storage, {
    set(target, key, value) {
      if (rejectAccountWrites && key === "accounts:v1")
        throw new Error("Credential removal failed");
      target[key] = value;
      return true;
    },
  });
  const events = new EventTarget();
  const locations = [];
  const deletedDatabases = [];
  const deletionRequests = [];
  const notices = {};
  globalThis.sessionStorage = {
    setItem: (key, value) => {
      notices[key] = value;
    },
  };
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
      const request = { error: new Error("Deletion failed") };
      deletionRequests.push(request);
      if (deleteMode !== "pending")
        queueMicrotask(() => {
          if (deleteMode === "blocked") request.onblocked();
          else if (deleteMode === "error") request.onerror();
          else request.onsuccess();
        });
      return request;
    },
  };
  setPersistentEngine(engine, {
    addEventListener: (_key, listener) =>
      events.addEventListener("storage", listener),
    removeEventListener: (_key, listener) =>
      events.removeEventListener("storage", listener),
  });
  const store = await import(
    `../../src/stores/authStore.js?fixture=${++fixtureId}`
  );
  return {
    ...store,
    storage,
    events,
    locations,
    deletedDatabases,
    deletionRequests,
    notices,
    failAccountWrites: (value) => {
      rejectAccountWrites = value;
    },
  };
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

test("logout removes credentials first, shares concurrent calls, and waits for database deletion", async () => {
  const f = await fixture(
    { auth: JSON.stringify(auth) },
    { deleteMode: "pending" },
  );
  let stops = 0;
  f.events.addEventListener("nextflux:logout", () => stops++);
  const first = f.logout();
  assert.equal(f.logout(), first);
  await Promise.resolve();
  assert.equal(f.accountsState.get().accounts.length, 0);
  assert.equal(f.sessionEnding.get(), true);
  assert.deepEqual(f.locations, []);
  assert.equal(stops, 1);
  f.deletionRequests[0].onsuccess();
  await first;
  assert.deepEqual(f.locations, ["/login"]);
  assert.equal(stops, 1);
  await f.logout();
  assert.equal(f.deletedDatabases.length, 1);
});

test("failed credential removal leaves the session running and allows retry", async () => {
  const f = await fixture({ auth: JSON.stringify(auth) });
  let stops = 0;
  f.events.addEventListener("nextflux:logout", () => stops++);
  f.failAccountWrites(true);
  await assert.rejects(f.logout(), /Credential removal failed/);
  assert.equal(f.accountsState.get().accounts.length, 1);
  assert.equal(f.sessionEnding.get(), false);
  assert.equal(stops, 0);
  assert.deepEqual(f.deletedDatabases, []);
  assert.deepEqual(f.locations, []);
  f.failAccountWrites(false);
  await f.logout();
  assert.equal(f.accountsState.get().accounts.length, 0);
  assert.equal(stops, 1);
});

test("one failed metadata removal does not skip other data or prevent logout", async () => {
  const f = await fixture(
    {
      auth: JSON.stringify(auth),
      lastSyncTime: "timestamp",
      "syncBootstrap:v1": "checkpoint",
      "syncHistoryComplete:v1": "true",
      categoryExpanded: "{}",
      "mediaProgress:v1:1": "progress",
      "other-account:mediaProgress:v1:1": "keep",
      settings: "keep-settings",
    },
    { failRemoveKey: "lastSyncTime" },
  );
  await f.logout();
  assert.equal(f.accountsState.get().accounts.length, 0);
  assert.equal(f.storage.lastSyncTime, "timestamp");
  for (const key of [
    "syncBootstrap:v1",
    "syncHistoryComplete:v1",
    "categoryExpanded",
    "mediaProgress:v1:1",
  ]) {
    assert.equal(f.storage[key], undefined, key);
  }
  assert.equal(f.storage["other-account:mediaProgress:v1:1"], "keep");
  assert.equal(f.storage.settings, "keep-settings");
  assert.equal(f.notices[LOGOUT_NOTICE_KEY], "true");
  assert.deepEqual(f.locations, ["/login"]);
});

for (const deleteMode of ["error", "blocked"]) {
  test(`database deletion ${deleteMode} completes logout with a cleanup warning`, async () => {
    const f = await fixture({ auth: JSON.stringify(auth) }, { deleteMode });
    await f.logout();
    assert.equal(f.accountsState.get().accounts.length, 0);
    assert.equal(f.notices[LOGOUT_NOTICE_KEY], "true");
    assert.deepEqual(f.locations, ["/login"]);
  });
}

test("authentication expiry clears credentials, retains account and cache, and can reauthenticate", async () => {
  const f = await fixture({ auth: JSON.stringify(auth), lastSyncTime: "keep" });
  let stops = 0;
  f.events.addEventListener("nextflux:logout", () => stops++);
  const original = f.authState.get();
  f.expireSession();
  f.expireSession();
  assert.equal(stops, 1);
  const expired = f.authState.get();
  assert.equal(expired.password, "");
  assert.equal(expired.token, "");
  assert.equal(expired.id, original.id);
  assert.equal(expired.databaseName, original.databaseName);
  assert.equal(f.storage.lastSyncTime, "keep");
  assert.deepEqual(f.deletedDatabases, []);
  assert.deepEqual(f.locations, ["/login"]);

  const restored = await fixture({
    "accounts:v1": f.storage["accounts:v1"],
    lastSyncTime: "keep",
  });
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ id: 1, username: "alice" }),
  });
  await restored.login(auth.serverUrl, auth.username, "new-password", "");
  assert.equal(restored.authState.get().databaseName, original.databaseName);
  assert.equal(restored.accountsState.get().accounts.length, 1);
  assert.equal(restored.storage.lastSyncTime, "keep");
  assert.deepEqual(restored.deletedDatabases, []);
  assert.deepEqual(restored.locations, ["/"]);
});

test("token expiry preserves other accounts and their credentials", async () => {
  const alice = saveAccount(emptyAccounts, auth);
  const both = saveAccount(alice, {
    serverUrl: auth.serverUrl,
    username: "bob",
    userId: 2,
    authType: "token",
    token: "bob-token",
    password: "",
  });
  const f = await fixture({ "accounts:v1": JSON.stringify(both) });
  f.expireSession();
  assert.equal(f.accountsState.get().accounts.length, 2);
  assert.equal(f.authState.get().username, "bob");
  assert.equal(f.authState.get().token, "");
  assert.equal(f.accountsState.get().accounts[0].password, auth.password);
  assert.deepEqual(f.deletedDatabases, []);
  assert.deepEqual(f.locations, ["/login"]);
});

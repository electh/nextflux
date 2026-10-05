import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyAccounts,
  emptyAuth,
  accountId,
  accountStorageKey,
  getActiveAccount,
  isAuthenticated,
  migrateLegacyAuth,
  removeAccount,
  saveAccount,
} from "../../src/domain/auth/accounts.js";
import { createSyncMetadataRepository } from "../../src/db/repositories/syncMetadataRepository.js";

const first = {
  serverUrl: "https://rss.example/",
  userId: 1,
  username: "alice",
  password: "secret",
  authType: "basic",
};
const second = { ...first, userId: 2, username: "bob" };

test("isolates users on one server and equal user IDs on different servers", () => {
  const state = saveAccount(
    saveAccount(saveAccount(emptyAccounts, first), second),
    { ...first, serverUrl: "https://other.example" },
  );
  assert.equal(state.accounts.length, 3);
  assert.equal(
    new Set(state.accounts.map((account) => account.databaseName)).size,
    3,
  );
  assert.equal(getActiveAccount(state).serverUrl, "https://other.example");
});

test("a refreshed login updates credentials without duplicating the account or losing its cache", () => {
  const migrated = migrateLegacyAuth(first);
  const state = saveAccount(migrated, {
    ...first,
    serverUrl: "https://rss.example/v1/",
    username: "renamed",
    authType: "token",
    password: "",
    token: "new-token",
  });
  assert.equal(state.accounts.length, 1);
  assert.equal(getActiveAccount(state).databaseName, "minifluxReader");
  assert.equal(getActiveAccount(state).token, "new-token");
  assert.equal(getActiveAccount(state).username, "renamed");
  assert.equal(
    accountId(first),
    accountId({ ...first, userId: "1", serverUrl: "https://rss.example" }),
  );
});

test("logout preserves the other account and selects it, then clears the final session", () => {
  const state = saveAccount(saveAccount(emptyAccounts, first), second);
  const remaining = removeAccount(state, accountId(second));
  assert.deepEqual(remaining.accounts, [state.accounts[0]]);
  assert.equal(getActiveAccount(remaining).username, "alice");
  assert.deepEqual(
    getActiveAccount(removeAccount(remaining, accountId(first))),
    emptyAuth,
  );
});

test("only a valid legacy login adopts the original cache and sync keys", () => {
  assert.deepEqual(migrateLegacyAuth(null), emptyAccounts);
  assert.deepEqual(migrateLegacyAuth(emptyAuth), emptyAccounts);
  const legacy = getActiveAccount(migrateLegacyAuth(first));
  assert.equal(accountStorageKey(legacy, "lastSyncTime"), "lastSyncTime");
  assert.equal(
    isAuthenticated({
      ...first,
      authType: "token",
      password: "",
      token: "key",
    }),
    true,
  );
});

test("sync watermarks, bootstrap progress and completion flags stay with their account", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  try {
    const state = saveAccount(saveAccount(migrateLegacyAuth(first), second), {
      ...first,
      serverUrl: "https://other.example",
    });
    const repositories = state.accounts.map((account) =>
      createSyncMetadataRepository((key) => accountStorageKey(account, key)),
    );
    const timestamp = new Date("2026-10-05T10:00:00Z");
    const bootstrap = {
      entries: { offset: 100 },
      startedAt: timestamp.toISOString(),
    };
    repositories[0].setLastSyncTime(timestamp);
    repositories[0].setHistorySyncComplete();
    repositories[0].setSyncBootstrap(bootstrap);
    for (const repository of repositories.slice(1)) {
      assert.equal(repository.getLastSyncTime(), null);
      assert.equal(repository.getSyncBootstrap(), null);
      assert.equal(repository.isHistorySyncComplete(), false);
    }
    repositories[1].setSyncBootstrap({
      ...bootstrap,
      entries: { offset: 200 },
    });
    repositories[1].setSyncBootstrap(null);
    assert.deepEqual(repositories[0].getSyncBootstrap(), bootstrap);
    assert.equal(
      repositories[0].getLastSyncTime().toISOString(),
      timestamp.toISOString(),
    );
  } finally {
    delete globalThis.localStorage;
  }
});

import { accountStorageKey } from "../domain/auth/accounts.js";

export const LOGOUT_NOTICE_KEY = "nextflux:logoutCleanupWarning";

export function deleteAccountDatabase(name, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    const timer = setTimeout(
      () => reject(new Error("Database deletion timed out")),
      timeoutMs,
    );
    const finish = (error) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    request.onsuccess = () => finish();
    request.onerror = () =>
      finish(request.error || new Error("Database deletion failed"));
    request.onblocked = () =>
      finish(new Error("Database deletion blocked by another connection"));
  });
}

export async function cleanupAccountData(account) {
  const errors = [];
  // Attach a rejection handler immediately, including for synchronous IDB failures.
  const database = deleteAccountDatabase(account.databaseName).catch((error) =>
    errors.push(error),
  );
  const remove = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      errors.push(error);
    }
  };
  for (const key of [
    "lastSyncTime",
    "syncBootstrap:v1",
    "syncHistoryComplete:v1",
    "categoryExpanded",
  ]) {
    remove(accountStorageKey(account, key));
  }
  try {
    const prefix = accountStorageKey(account, "mediaProgress:v1:");
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) remove(key);
    }
  } catch (error) {
    errors.push(error);
  }
  await database;
  return errors;
}

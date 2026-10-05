import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { normalizeServerUrl } from "../lib/url.js";
import { reportError } from "../lib/errors.js";
import {
  emptyAccounts,
  getActiveAccount,
  isAuthenticated,
  migrateLegacyAuth,
  saveAccount,
  removeAccount,
  accountStorageKey,
} from "../domain/auth/accounts.js";

export const accountsState = persistentAtom("accounts:v1", emptyAccounts, {
  encode: JSON.stringify,
  decode: (value) => {
    try {
      const state = JSON.parse(value);
      return Array.isArray(state?.accounts) ? state : emptyAccounts;
    } catch {
      return emptyAccounts;
    }
  },
});

// Adopt the existing cache only for its original owner.
if (!localStorage.getItem("accounts:v1")) {
  try {
    const legacy = JSON.parse(localStorage.getItem("auth"));
    accountsState.set(migrateLegacyAuth(legacy));
  } catch {
    accountsState.set(emptyAccounts);
  }
}
localStorage.removeItem("auth");

export const authState = computed(accountsState, getActiveAccount);
// The database and requests stay bound to this session until the page reloads.
export const sessionAccount = authState.get();
let transitioning = false;
function reloadSession(auth, force = false) {
  if (
    transitioning ||
    (!force && JSON.stringify(auth) === JSON.stringify(sessionAccount))
  )
    return;
  transitioning = true;
  window.dispatchEvent(new Event("nextflux:logout"));
  window.location.replace(isAuthenticated(auth) ? "/" : "/login");
}
authState.listen((auth) => reloadSession(auth));

export async function login(serverUrl, username, password, token) {
  try {
    const normalizedServerUrl = normalizeServerUrl(serverUrl);
    const headers = token
      ? { "X-Auth-Token": token }
      : { Authorization: "Basic " + btoa(`${username}:${password}`) };
    const response = await fetch(`${normalizedServerUrl}/v1/me`, { headers });
    if (!response.ok) {
      throw new Error(
        response.statusText || `HTTP error! status: ${response.status}`,
      );
    }
    const user = await response.json();
    accountsState.set(
      saveAccount(accountsState.get(), {
        serverUrl: normalizedServerUrl,
        username: user.username,
        password: token ? "" : password,
        token: token || "",
        authType: token ? "token" : "basic",
        userId: user.id,
      }),
    );
    reloadSession(authState.get(), true);
    return user;
  } catch (error) {
    throw reportError(error, "auth.login");
  }
}

export function switchAccount(id) {
  const state = accountsState.get();
  if (!state.accounts.some((account) => account.id === id)) return;
  accountsState.set({ ...state, activeAccountId: id });
}

export async function logout() {
  const state = accountsState.get();
  const account = getActiveAccount(state);
  if (!account.id) return;
  window.dispatchEvent(new Event("nextflux:logout"));
  // Remove only this account's cache and metadata; keep other accounts and preferences.
  indexedDB.deleteDatabase(account.databaseName);
  for (const key of [
    "lastSyncTime",
    "syncBootstrap:v1",
    "syncHistoryComplete:v1",
    "categoryExpanded",
  ]) {
    localStorage.removeItem(accountStorageKey(account, key));
  }
  const mediaProgressPrefix = accountStorageKey(account, "mediaProgress:v1:");
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(mediaProgressPrefix)) localStorage.removeItem(key);
  }
  accountsState.set(removeAccount(state, account.id));
}

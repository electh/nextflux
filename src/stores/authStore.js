import { persistentAtom } from "@nanostores/persistent";
import { atom, computed } from "nanostores";
import { normalizeServerUrl } from "../lib/url.js";
import { reportError } from "../lib/errors.js";
import {
  emptyAccounts,
  getActiveAccount,
  isAuthenticated,
  migrateLegacyAuth,
  saveAccount,
  removeAccount,
} from "../domain/auth/accounts.js";
import {
  cleanupAccountData,
  LOGOUT_NOTICE_KEY,
} from "../services/accountCleanup.js";

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
export const sessionEnding = atom(false);
let transitioning = false;
let sessionStopped = false;
let endingSession = false;
let logoutPromise = null;

function stopSession() {
  if (sessionStopped) return;
  sessionStopped = true;
  sessionEnding.set(true);
  window.dispatchEvent(new Event("nextflux:logout"));
}

function reloadSession(auth, force = false) {
  if (
    endingSession ||
    transitioning ||
    (!force && JSON.stringify(auth) === JSON.stringify(sessionAccount))
  )
    return;
  transitioning = true;
  stopSession();
  window.location.replace(isAuthenticated(auth) ? "/" : "/login");
}
authState.listen((auth) => reloadSession(auth));

export async function login(serverUrl, username, password, token) {
  try {
    if (endingSession || transitioning) throw new Error("Session is ending");
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
    if (endingSession || transitioning) throw new Error("Session is ending");
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
  if (endingSession || transitioning) return;
  const state = accountsState.get();
  if (!state.accounts.some((account) => account.id === id)) return;
  accountsState.set({ ...state, activeAccountId: id });
}

// Expired authentication keeps the account identity and cache for reauthentication.
export function expireSession() {
  if (endingSession || transitioning || !sessionAccount.id) return;
  const state = accountsState.get();
  const account = getActiveAccount(state);
  if (JSON.stringify(account) !== JSON.stringify(sessionAccount)) return;
  accountsState.set({
    ...state,
    accounts: state.accounts.map((item) =>
      item.id === account.id ? { ...item, password: "", token: "" } : item,
    ),
  });
}

export function logout() {
  if (logoutPromise) return logoutPromise;
  const account = getActiveAccount(accountsState.get());
  if (transitioning || !account.id || account.id !== sessionAccount.id)
    return Promise.resolve();
  endingSession = true;
  logoutPromise = Promise.resolve().then(async () => {
    try {
      // Persist credential removal before stopping the current session. If this
      // write fails, leave the session usable so the user can retry.
      accountsState.set(removeAccount(accountsState.get(), account.id));
    } catch (error) {
      endingSession = false;
      logoutPromise = null;
      throw error;
    }
    stopSession();
    let errors;
    try {
      errors = await cleanupAccountData(account);
    } catch (error) {
      errors = [error];
    }
    if (errors.length) {
      for (const error of errors) reportError(error, "auth.logoutCleanup");
      try {
        sessionStorage.setItem(LOGOUT_NOTICE_KEY, "true");
      } catch {
        /* Logout still completes when sessionStorage is unavailable. */
      }
    }
    endingSession = false;
    reloadSession(authState.get(), true);
  });
  return logoutPromise;
}

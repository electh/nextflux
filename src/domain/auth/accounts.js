import { normalizeServerUrl } from "../../lib/url.js";

export const emptyAuth = {
  serverUrl: "",
  username: "",
  password: "",
  userId: "",
  token: "",
  authType: "basic",
};
export const emptyAccounts = { accounts: [], activeAccountId: null };

export function accountId(auth) {
  return JSON.stringify([
    normalizeServerUrl(auth.serverUrl),
    String(auth.userId),
  ]);
}

export function isAuthenticated(auth) {
  return Boolean(
    auth?.serverUrl &&
    auth.username &&
    (auth.authType === "token" ? auth.token : auth.password),
  );
}

export function getActiveAccount(state) {
  return (
    state?.accounts.find(({ id }) => id === state.activeAccountId) || emptyAuth
  );
}

export function saveAccount(state, auth) {
  const id = accountId(auth);
  const existing = state.accounts.find((account) => account.id === id);
  const account = {
    ...auth,
    id,
    serverUrl: normalizeServerUrl(auth.serverUrl),
    databaseName:
      existing?.databaseName || `minifluxReader:${encodeURIComponent(id)}`,
  };
  return {
    accounts: [...state.accounts.filter((item) => item.id !== id), account],
    activeAccountId: id,
  };
}

export function removeAccount(state, id) {
  const accounts = state.accounts.filter((account) => account.id !== id);
  return {
    accounts,
    activeAccountId:
      state.activeAccountId === id
        ? accounts[0]?.id || null
        : state.activeAccountId,
  };
}

export function migrateLegacyAuth(auth) {
  if (!isAuthenticated(auth)) return emptyAccounts;
  const state = saveAccount(emptyAccounts, auth);
  state.accounts[0].databaseName = "minifluxReader";
  return state;
}

export function accountStorageKey(account, key) {
  return account?.databaseName === "minifluxReader"
    ? key
    : `${account?.databaseName || "minifluxReader:anonymous"}:${key}`;
}

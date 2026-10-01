const LAST_SYNC_KEY = "lastSyncTime";

export function setLastSyncTime(time) {
  localStorage.setItem(LAST_SYNC_KEY, time.toISOString());
}

export function getLastSyncTime() {
  const time = localStorage.getItem(LAST_SYNC_KEY);
  const parsed = time ? new Date(time) : null;
  return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
}

const BOOTSTRAP_KEY = "syncBootstrap:v1";
export function getSyncBootstrap() {
  try {
    const state = JSON.parse(localStorage.getItem(BOOTSTRAP_KEY));
    return state &&
      (state.entries || (state.unread && state.starred)) &&
      Number.isFinite(new Date(state.startedAt).getTime())
      ? state
      : null;
  } catch {
    return null;
  }
}
export function setSyncBootstrap(state) {
  if (state) localStorage.setItem(BOOTSTRAP_KEY, JSON.stringify(state));
  else localStorage.removeItem(BOOTSTRAP_KEY);
}

// A previous incremental watermark does not mean the read history was downloaded.
const HISTORY_SYNC_KEY = "syncHistoryComplete:v1";
export function isHistorySyncComplete() {
  return localStorage.getItem(HISTORY_SYNC_KEY) === "true";
}
export function setHistorySyncComplete() {
  localStorage.setItem(HISTORY_SYNC_KEY, "true");
}

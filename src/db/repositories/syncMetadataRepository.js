export function createSyncMetadataRepository(keyFor = (key) => key) {
  const LAST_SYNC_KEY = "lastSyncTime";

  function setLastSyncTime(time) {
    localStorage.setItem(keyFor(LAST_SYNC_KEY), time.toISOString());
  }

  function getLastSyncTime() {
    const time = localStorage.getItem(keyFor(LAST_SYNC_KEY));
    const parsed = time ? new Date(time) : null;
    return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
  }

  const BOOTSTRAP_KEY = "syncBootstrap:v1";
  function getSyncBootstrap() {
    try {
      const state = JSON.parse(localStorage.getItem(keyFor(BOOTSTRAP_KEY)));
      return state &&
        (state.entries || (state.unread && state.starred)) &&
        Number.isFinite(new Date(state.startedAt).getTime())
        ? state
        : null;
    } catch {
      return null;
    }
  }
  function setSyncBootstrap(state) {
    if (state)
      localStorage.setItem(keyFor(BOOTSTRAP_KEY), JSON.stringify(state));
    else localStorage.removeItem(keyFor(BOOTSTRAP_KEY));
  }

  // A previous incremental watermark does not mean the read history was downloaded.
  const HISTORY_SYNC_KEY = "syncHistoryComplete:v1";
  function isHistorySyncComplete() {
    return localStorage.getItem(keyFor(HISTORY_SYNC_KEY)) === "true";
  }
  function setHistorySyncComplete() {
    localStorage.setItem(keyFor(HISTORY_SYNC_KEY), "true");
  }

  return {
    setLastSyncTime,
    getLastSyncTime,
    getSyncBootstrap,
    setSyncBootstrap,
    isHistorySyncComplete,
    setHistorySyncComplete,
  };
}

export const {
  setLastSyncTime,
  getLastSyncTime,
  getSyncBootstrap,
  setSyncBootstrap,
  isHistorySyncComplete,
  setHistorySyncComplete,
} = createSyncMetadataRepository();

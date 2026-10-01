import {
  getIncrementalSyncStart,
  mapRemoteFeed,
} from "../domain/sync/syncData.js";

export function createSyncService({
  api,
  repository,
  mapEntry,
  now = () => new Date(),
  batchSize = 200,
  firstPageSize = 30,
  yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0)),
}) {
  let inFlight = null;

  async function syncFeeds({ signal } = {}) {
    const [serverFeeds, serverCategories] = await Promise.all([
      api.getFeeds({ signal }),
      api.getCategories({ signal }),
    ]);
    signal?.throwIfAborted();
    return repository.reconcileFeeds(
      serverFeeds.map(mapRemoteFeed),
      serverCategories.map(({ id, title, hide_globally }) => ({
        id,
        title,
        hide_globally,
      })),
    );
  }

  // ID keyset pagination remains stable when entries change status between pages.
  // Do not rely on limit=0: recent Miniflux releases cap oversized responses.
  async function pullEntries(
    params,
    { signal, onBatch, initial = false, checkpoint, state } = {},
  ) {
    let beforeId = checkpoint?.beforeId;
    if (checkpoint?.done) return;
    let first = true;
    while (true) {
      signal?.throwIfAborted();
      const { entries = [], total } = await api.getEntriesPage(
        {
          ...params,
          order: "id",
          direction: "desc",
          limit: first && initial ? firstPageSize : batchSize,
          ...(beforeId ? { before_entry_id: beforeId } : {}),
        },
        { signal },
      );
      signal?.throwIfAborted();
      if (!entries.length) {
        if (checkpoint) {
          checkpoint.done = true;
          repository.setSyncBootstrap(state);
        }
        break;
      }
      const nextId = Math.min(...entries.map(({ id }) => id));
      if (beforeId !== undefined && nextId >= beforeId) {
        throw new Error("Miniflux entry cursor did not advance");
      }
      const changed = await repository.mergeArticles(entries.map(mapEntry));
      if (changed.length) await onBatch?.({ articles: changed, first });
      beforeId = nextId;
      const complete = Number.isInteger(total) && total === entries.length;
      if (checkpoint) {
        checkpoint.beforeId = beforeId;
        checkpoint.done = complete;
        repository.setSyncBootstrap(state);
      }
      if (complete) break;
      first = false;
      // A short response may be a server-side cap; only an empty page ends traversal.
      await yieldToUI();
    }
  }

  async function syncEntries(options = {}) {
    const lastSyncTime = repository.getLastSyncTime();
    if (lastSyncTime && repository.isHistorySyncComplete()) {
      await pullEntries(
        {
          status: ["read", "unread"],
          changed_after: Math.floor(
            getIncrementalSyncStart(lastSyncTime).getTime() / 1000,
          ),
        },
        options,
      );
    } else {
      const saved = repository.getSyncBootstrap();
      // Migrate the earlier unread/starred-only bootstrap by traversing all retained history.
      const state = saved?.entries
        ? saved
        : {
            startedAt: saved?.startedAt || now().toISOString(),
            entries: {},
          };
      repository.setSyncBootstrap(state);
      await pullEntries(
        { status: ["read", "unread"] },
        { ...options, initial: true, checkpoint: state.entries, state },
      );
      // Replay state changes/new entries that occurred during bootstrap or an interruption.
      await pullEntries(
        {
          status: ["read", "unread"],
          changed_after: Math.floor(
            getIncrementalSyncStart(state.startedAt).getTime() / 1000,
          ),
        },
        options,
      );
    }
  }

  function synchronize(options = {}) {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      // Save the START of the successful run so changes during traversal are replayed.
      // The small overlap covers the API's strict, second-resolution time boundary.
      const startedAt = now();
      const results = await Promise.allSettled([
        syncFeeds(options).then(async (feedsChanged) => {
          if (feedsChanged)
            await options.onBatch?.({ feedsChanged: true, articles: [] });
        }),
        syncEntries(options),
      ]);
      const failed = results.find((result) => result.status === "rejected");
      if (failed) throw failed.reason;
      options.signal?.throwIfAborted();
      repository.setLastSyncTime(startedAt);
      repository.setHistorySyncComplete();
      repository.setSyncBootstrap(null);
      return startedAt;
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  return { synchronize, syncEntries, syncFeeds };
}

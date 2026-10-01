export function createIconLoader({
  get,
  put,
  fetchIcon,
  now = Date.now,
  isOnline = () => true,
}) {
  const pending = new Map();
  let generation = 0;
  function load(feedId) {
    if (pending.has(feedId)) return pending.get(feedId);
    const startedGeneration = generation;
    const request = (async () => {
      const cached = await get(feedId);
      const age = now() - Date.parse(cached?.updated_at);
      const ttl = (cached?.missing ? 1 : 7) * 24 * 60 * 60 * 1000;
      if ((cached && age < ttl) || !isOnline())
        return cached?.missing ? null : cached;
      const remote = await fetchIcon(feedId);
      if (generation !== startedGeneration) return null;
      // undefined means a transient failure; null means the server has no favicon.
      if (remote !== undefined)
        await put({ feedId, ...remote, missing: remote === null });
      return remote === undefined ? (cached?.missing ? null : cached) : remote;
    })().finally(() => {
      if (pending.get(feedId) === request) pending.delete(feedId);
    });
    pending.set(feedId, request);
    return request;
  }
  return {
    load,
    clear: () => {
      generation++;
      pending.clear();
    },
  };
}

// One browser listener per query, shared by every mounted consumer.
export function createMediaQueryStore(
  query,
  matchMedia = (value) => window.matchMedia(value),
) {
  let media;
  const listeners = new Set();
  const getMedia = () => (media ??= matchMedia(query));
  const notify = () => {
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => getMedia().matches,
    getServerSnapshot: () => false,
    subscribe(listener) {
      if (listeners.size === 0) getMedia().addEventListener("change", notify);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0)
          getMedia().removeEventListener("change", notify);
      };
    },
  };
}

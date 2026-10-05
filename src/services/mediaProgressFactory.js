export function normalizeMediaProgress(value) {
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

// Serialize writes per enclosure, including when a player is reopened mid-request.
export function createMediaProgressService({
  read,
  write,
  fetch,
  update,
  onError,
}) {
  const queues = new Map();
  return {
    async load(enclosure) {
      const local = read(enclosure.id);
      if (local?.pending) return local.position;
      try {
        const remote = await fetch(enclosure.id);
        // Playback may have started while the request was in flight.
        const latest = read(enclosure.id);
        if (latest?.pending) return latest.position;
        const position = normalizeMediaProgress(remote.media_progression);
        write(enclosure.id, { position, pending: false });
        return position;
      } catch {
        return (
          local?.position ?? normalizeMediaProgress(enclosure.media_progression)
        );
      }
    },
    remember(id, position) {
      write(id, { position: normalizeMediaProgress(position), pending: true });
    },
    flush(id) {
      if (queues.has(id)) return queues.get(id);
      const pending = read(id);
      if (!pending?.pending) return Promise.resolve();
      const job = (async () => {
        let record = pending;
        try {
          while (record?.pending) {
            await update(id, record.position);
            const latest = read(id);
            if (latest?.position === record.position) {
              write(id, { ...latest, pending: false });
              break;
            }
            record = latest;
          }
        } catch (error) {
          onError(error);
        } finally {
          queues.delete(id);
        }
      })();
      queues.set(id, job);
      return job;
    },
  };
}

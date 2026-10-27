export function createOutboxService({ repository, api, batchSize = 100 }) {
  return async function flush({ signal } = {}) {
    const articles = await repository.getPendingArticles();
    const groups = new Map();
    for (const article of articles) {
      const changes = Object.fromEntries(
        Object.entries(article.pendingChanges)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([field, change]) => [
            field,
            field === "starred" ? change.value === 1 : change.value,
          ]),
      );
      const key = JSON.stringify(changes);
      if (!groups.has(key)) groups.set(key, { changes, articles: [] });
      groups.get(key).articles.push(article);
    }
    for (const group of groups.values()) {
      for (let start = 0; start < group.articles.length; start += batchSize) {
        signal?.throwIfAborted();
        const batch = group.articles.slice(start, start + batchSize);
        // Explicit desired values make retries safe after a lost acknowledgement.
        await api.updateEntries(
          batch.map(({ id }) => id),
          group.changes,
        );
        signal?.throwIfAborted();
        for (const article of batch) {
          await repository.acknowledgeArticleChanges(
            article.id,
            article.pendingChanges,
          );
        }
      }
    }
  };
}

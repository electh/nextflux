export function pendingFields(article) {
  return Object.entries(article.pendingChanges || {});
}

export function mergePendingArticle(remote, local) {
  if (!local || !pendingFields(local).length) return remote;
  // A server tombstone cannot discard a locally queued edit before delivery.
  const merged = remote.status === "removed" ? { ...local } : { ...remote };
  merged.pendingChanges = local.pendingChanges;
  for (const [field, change] of pendingFields(local))
    merged[field] = change.value;
  return merged;
}

export function acknowledgeChanges(article, sent) {
  const pending = { ...article.pendingChanges };
  for (const [field, change] of Object.entries(sent)) {
    if (pending[field]?.token === change.token) delete pending[field];
  }
  return pending;
}

// Acquire before publishing optimistic state, so even same-tick clicks are ignored.
export function createArticleMutations({ patch, onPending }) {
  const pending = {};
  return async (article, field, value, persist) => {
    const key = `${article.id}:${field}`;
    if (key in pending) return false;
    pending[key] = value;
    onPending({ ...pending });
    try {
      patch(article.id, { [field]: value });
      await persist();
      return true;
    } catch (error) {
      patch(article.id, { [field]: article[field] });
      throw error;
    } finally {
      delete pending[key];
      onPending({ ...pending });
    }
  };
}

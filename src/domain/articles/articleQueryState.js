export function getArticleQueryState(articleId, result) {
  if (!articleId) return { error: null, loading: false };
  if (!result || result.articleId !== articleId) {
    return { error: null, loading: true };
  }
  return { error: result.error ?? null, loading: false };
}

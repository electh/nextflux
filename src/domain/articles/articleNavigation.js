export function getArticleBasePath(pathname) {
  return pathname.split("/article/")[0] || "/";
}

export function getAdjacentArticle(articles, activeArticleId, direction) {
  const index = articles.findIndex(({ id }) => id === activeArticleId);
  const targetIndex = direction === "previous" ? index - 1 : index + 1;
  return targetIndex >= 0 && targetIndex < articles.length
    ? articles[targetIndex]
    : null;
}

export function getArticleTransitionDirection(articles, fromId, toId) {
  const from = articles.findIndex(({ id }) => id === Number(fromId));
  const to = articles.findIndex(({ id }) => id === Number(toId));
  if (from < 0 || to < 0 || from === to) return null;
  return to > from ? 1 : -1;
}

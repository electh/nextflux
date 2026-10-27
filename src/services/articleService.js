import {
  getArticlesByPage,
  getFeeds,
  getStarredCount,
  getUnreadCount,
} from "@/db/storage.js";
import { queueArticleChanges } from "@/db/repositories/outboxRepository.js";
import { getArticleFeedIds } from "@/domain/articles/articleScope.js";

export async function loadArticlePage({
  sourceId,
  type,
  page,
  pageSize,
  filter,
  settings,
}) {
  const storedFeeds = await getFeeds();
  const feedIds = getArticleFeedIds(storedFeeds, {
    type,
    id: sourceId,
    showHiddenFeeds: settings.showHiddenFeeds,
  });

  // Read the loaded prefix plus one sentinel; no full collection sort or count.
  const articles = await getArticlesByPage(
    feedIds,
    filter,
    1,
    page * pageSize + 1,
    settings.sortDirection,
    settings.sortField,
  );
  const isMore = articles.length > page * pageSize;
  return {
    articles: articles.slice((page - 1) * pageSize, page * pageSize),
    isMore,
  };
}

export async function persistArticleStatus(article, status) {
  await queueArticleChanges([article.id], { status });
  return getUnreadCount(article.feedId);
}

export async function persistArticleStarred(article, starred) {
  await queueArticleChanges([article.id], { starred });
  return getStarredCount(article.feedId);
}

export async function persistArticlesAsRead(articles) {
  const ids = articles.map(({ id }) => id);
  await queueArticleChanges(ids, { status: "read" });
}

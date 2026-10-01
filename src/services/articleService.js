import {
  updateArticleFields,
  updateArticleStatuses,
  getArticlesByPage,
  getFeeds,
  getStarredCount,
  getUnreadCount,
} from "@/db/storage.js";
import { updateEntries } from "@/api/resources/entries.js";
import { getArticleFeedIds } from "@/domain/articles/articleScope.js";

const remoteUpdate = (operation) =>
  navigator.onLine ? operation() : Promise.resolve();

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
  await remoteUpdate(() => updateEntries([article.id], { status }));
  await updateArticleFields(article.id, { status });
  return getUnreadCount(article.feedId);
}

export async function persistArticleStarred(article, starred) {
  await remoteUpdate(() =>
    updateEntries([article.id], { starred: starred === 1 }),
  );
  await updateArticleFields(article.id, { starred });
  return getStarredCount(article.feedId);
}

export async function persistArticlesAsRead(articles) {
  const ids = articles.map(({ id }) => id);
  await remoteUpdate(() => updateEntries(ids, { status: "read" }));
  await updateArticleStatuses(ids, "read");
}

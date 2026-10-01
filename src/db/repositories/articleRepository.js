import { db } from "@/db/database.js";
import { reportError } from "@/lib/errors.js";

export const addArticles = (articles) => db.articles.bulkPut(articles);

export function markUnreadArticlesAsRead(feedIds) {
  const targetFeedIds = new Set(feedIds.map(Number));
  if (targetFeedIds.size === 0) return 0;

  return db.articles
    .where("status")
    .equals("unread")
    .and((article) => targetFeedIds.has(article.feedId))
    .modify({ status: "read" });
}

export const deleteArticlesByFeedId = (feedId) =>
  db.articles.where("feedId").equals(feedId).delete();

export const getUnreadCount = (feedId) =>
  db.articles.where(["status", "feedId"]).equals(["unread", feedId]).count();

export const getStarredCount = (feedId) =>
  db.articles.where(["starred", "feedId"]).equals([1, feedId]).count();

export function getArticlesCount(feedIds, filter = "all") {
  let query;
  if (filter === "unread") {
    query = db.articles
      .where("feedId")
      .anyOf(feedIds)
      .and((article) => article.status === "unread");
  } else if (filter === "starred") {
    query = db.articles
      .where("feedId")
      .anyOf(feedIds)
      .and((article) => article.starred === 1);
  } else {
    query = db.articles
      .where("feedId")
      .anyOf(feedIds)
      .and((article) => article.status !== "removed");
  }
  return query.count();
}

export async function getArticlesByPage(
  feedIds,
  filter = "all",
  page = 1,
  pageSize = 30,
  sortDirection = "desc",
  sortField = "published_at",
) {
  if (!feedIds.length) return [];
  const offset = (page - 1) * pageSize;
  const feedIdSet = new Set(feedIds);
  let collection = db.articles.orderBy(sortField);
  if (sortDirection === "desc") collection = collection.reverse();
  return collection
    .filter(
      (article) =>
        feedIdSet.has(article.feedId) &&
        article.status !== "removed" &&
        (filter !== "unread" || article.status === "unread") &&
        (filter !== "starred" || article.starred === 1),
    )
    .offset(offset)
    .limit(pageSize)
    .toArray();
}

export async function getArticleById(id) {
  const article = await db.articles.get(Number.parseInt(id, 10));
  if (!article) return null;
  const feed = await db.feeds.get(article.feedId);
  return { ...article, feed };
}

export async function searchArticles(
  keyword,
  showHiddenFeeds = false,
  sortField = "published_at",
) {
  try {
    const feeds = await db.feeds.toArray();
    const visibleFeedIds = feeds
      .filter((feed) => showHiddenFeeds || !feed.hide_globally)
      .map((feed) => feed.id);
    const articles = await db.articles
      .where("feedId")
      .anyOf(visibleFeedIds)
      .filter(
        (article) =>
          article.title &&
          article.title.toLowerCase().includes(keyword.toLowerCase()),
      )
      .sortBy(sortField);
    return articles.reverse();
  } catch (error) {
    throw reportError(error, "articles.search");
  }
}

export const updateArticleFields = (id, changes) =>
  db.articles.update(id, changes);
export const updateArticleStatuses = (ids, status) =>
  db.articles.where("id").anyOf(ids).modify({ status });

import Dexie from "dexie";
import { db } from "@/db/database.js";
import { changedRecords } from "@/domain/sync/reconcileRecords.js";

export async function reconcileFeeds(feeds, categories) {
  return db.transaction(
    "rw",
    db.feeds,
    db.categories,
    db.articles,
    db.feedIcons,
    async () => {
      const [localFeeds, localCategories] = await Promise.all([
        db.feeds.toArray(),
        db.categories.toArray(),
      ]);
      const feedIds = new Set(feeds.map(({ id }) => id));
      const categoryIds = new Set(categories.map(({ id }) => id));
      const removedFeeds = localFeeds
        .filter(({ id }) => !feedIds.has(id))
        .map(({ id }) => id);
      const removedCategories = localCategories
        .filter(({ id }) => !categoryIds.has(id))
        .map(({ id }) => id);
      const updatedFeeds = changedRecords(localFeeds, feeds);
      const updatedCategories = changedRecords(localCategories, categories);
      if (removedFeeds.length) {
        await db.articles.where("feedId").anyOf(removedFeeds).delete();
        await db.feedIcons.bulkDelete(removedFeeds);
        await db.feeds.bulkDelete(removedFeeds);
      }
      if (removedCategories.length)
        await db.categories.bulkDelete(removedCategories);
      if (updatedFeeds.length) await db.feeds.bulkPut(updatedFeeds);
      if (updatedCategories.length)
        await db.categories.bulkPut(updatedCategories);
      return Boolean(
        removedFeeds.length ||
        removedCategories.length ||
        updatedFeeds.length ||
        updatedCategories.length,
      );
    },
  );
}

export async function mergeArticles(articles) {
  if (!articles.length) return [];
  return db.transaction("rw", db.articles, async () => {
    const existing = await db.articles.bulkGet(articles.map(({ id }) => id));
    const existingIds = new Set(existing.filter(Boolean).map(({ id }) => id));
    // Cache read and unread articles equally; unknown tombstones require no write.
    const relevant = articles.filter(
      (article) => article.status !== "removed" || existingIds.has(article.id),
    );
    const changed = changedRecords(existing.filter(Boolean), relevant);
    const removedIds = changed
      .filter(({ status }) => status === "removed")
      .map(({ id }) => id);
    const upserts = changed.filter(({ status }) => status !== "removed");
    if (removedIds.length) await db.articles.bulkDelete(removedIds);
    if (upserts.length) await db.articles.bulkPut(upserts);
    return changed;
  });
}

// Two indexed scans instead of two queries for each feed.
export async function getFeedCounts() {
  const unread = {};
  const starred = {};
  const countIndex = (index, value, counts) =>
    db.articles
      .where(index)
      .between([value, Dexie.minKey], [value, Dexie.maxKey])
      .eachKey(([, feedId]) => {
        counts[feedId] = (counts[feedId] || 0) + 1;
      });
  await Promise.all([
    countIndex("[status+feedId]", "unread", unread),
    countIndex("[starred+feedId]", 1, starred),
  ]);
  return { unread, starred };
}

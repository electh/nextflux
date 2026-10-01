import { atom } from "nanostores";
import {
  getFeeds,
  markUnreadArticlesAsRead,
  getUnreadCount,
} from "../db/storage";
import minifluxAPI from "../api/miniflux";
import { starredCounts, unreadCounts } from "./feedCountersStore.js";
import { settingsState } from "./settingsStore";
import { getAffectedFeedIds } from "@/domain/articles/articleScope.js";
import {
  countArticlesByFeed,
  getUnreadArticlesInRange,
} from "@/domain/articles/articleRange.js";
import {
  persistArticleStarred,
  persistArticleStatus,
  persistArticlesAsRead,
} from "@/services/articleService.js";
import { createArticleMutations } from "@/services/articleMutations.js";
import { reportError } from "@/lib/errors.js";

export { filter } from "./articleFilterStore.js";

export const filteredArticles = atom([]);
export const activeArticle = atom(null);
export const loading = atom(false);
export const loadingMore = atom(false); // 加载更多文章
export const loadingOriginContent = atom(false);
export const markingAllAsRead = atom(false);
export const error = atom(null);
export const imageGalleryActive = atom(false);
export const hasMore = atom(true);
export const currentPage = atom(1);
export const pageSize = atom(30);
export const visibleRange = atom({
  startIndex: 0,
  endIndex: 0,
});

export const pendingArticleMutations = atom({});

function patchArticle(id, changes) {
  filteredArticles.set(
    filteredArticles
      .get()
      .map((article) =>
        article.id === id ? { ...article, ...changes } : article,
      ),
  );
  const current = activeArticle.get();
  if (current?.id === id) activeArticle.set({ ...current, ...changes });
}

const mutateArticle = createArticleMutations({
  patch: patchArticle,
  onPending: (pending) => pendingArticleMutations.set(pending),
});

export function updateArticleStatus(article) {
  if (!article) return;
  const status = article.status === "read" ? "unread" : "read";
  return mutateArticle(article, "status", status, async () => {
    const count = await persistArticleStatus(article, status);
    unreadCounts.set({ ...unreadCounts.get(), [article.feedId]: count });
  });
}

export function updateArticleStarred(article) {
  if (!article) return;
  const starred = article.starred === 1 ? 0 : 1;
  return mutateArticle(article, "starred", starred, async () => {
    const count = await persistArticleStarred(article, starred);
    starredCounts.set({ ...starredCounts.get(), [article.feedId]: count });
  });
}

export async function markAllAsRead(type = "all", id = null) {
  if (markingAllAsRead.get()) return;

  markingAllAsRead.set(true);

  try {
    const storedFeeds = await getFeeds();
    const showHiddenFeeds = settingsState.get().showHiddenFeeds;
    const affectedFeedIds = getAffectedFeedIds(storedFeeds, {
      type,
      id,
      showHiddenFeeds,
    });

    const articles = filteredArticles.get();
    const affectedFeedIdSet = new Set(affectedFeedIds);
    const originalStatuses = new Map(
      articles.map((article) => [article.id, article.status]),
    );

    // 乐观更新当前视图，不等待远程接口完成。
    filteredArticles.set(
      articles.map((article) =>
        affectedFeedIdSet.has(article.feedId) && article.status !== "read"
          ? { ...article, status: "read" }
          : article,
      ),
    );

    const updatedCounts = { ...unreadCounts.get() };

    affectedFeedIds.forEach((feedId) => {
      updatedCounts[feedId] = 0;
    });

    unreadCounts.set(updatedCounts);

    const rollbackFeeds = async (feedIds) => {
      const feedIdSet = new Set(feedIds);

      filteredArticles.set(
        filteredArticles
          .get()
          .map((article) =>
            feedIdSet.has(article.feedId) && originalStatuses.has(article.id)
              ? { ...article, status: originalStatuses.get(article.id) }
              : article,
          ),
      );

      const restoredCounts = { ...unreadCounts.get() };
      await Promise.all(
        feedIds.map(async (feedId) => {
          restoredCounts[feedId] = await getUnreadCount(feedId);
        }),
      );
      unreadCounts.set(restoredCounts);
    };

    if (!navigator.onLine) {
      try {
        await markUnreadArticlesAsRead(affectedFeedIds);
      } catch (error) {
        await rollbackFeeds(affectedFeedIds);
        throw error;
      }
      return;
    }

    let result;
    try {
      result = await minifluxAPI.markFeedsAsRead(affectedFeedIds);
    } catch (error) {
      await rollbackFeeds(affectedFeedIds);
      throw error;
    }

    if (result.failedFeedIds.length > 0) {
      await rollbackFeeds(result.failedFeedIds);
    }

    // 只持久化服务端已成功处理的 feed。
    await markUnreadArticlesAsRead(result.succeededFeedIds);

    if (result.failedFeedIds.length > 0) {
      throw new Error(`${result.failedFeedIds.length} 个订阅源标记已读失败`);
    }
  } catch (err) {
    throw reportError(err, "articles.markAllRead");
  } finally {
    markingAllAsRead.set(false);
  }
}

async function markArticleRangeAsRead(articleId, direction) {
  const articles = filteredArticles.get();
  const articlesToMark = getUnreadArticlesInRange(
    articles,
    articleId,
    direction,
  );
  if (articlesToMark.length === 0) return;

  const articleIds = new Set(articlesToMark.map(({ id }) => id));
  const countsByFeed = countArticlesByFeed(articlesToMark);
  filteredArticles.set(
    articles.map((article) =>
      articleIds.has(article.id) ? { ...article, status: "read" } : article,
    ),
  );

  try {
    await persistArticlesAsRead(articlesToMark);

    const updatedCounts = { ...unreadCounts.get() };
    Object.entries(countsByFeed).forEach(([feedId, count]) => {
      updatedCounts[feedId] = Math.max(0, (updatedCounts[feedId] || 0) - count);
    });
    unreadCounts.set(updatedCounts);
  } catch (err) {
    filteredArticles.set(articles);
    throw reportError(err, "articles.markRangeRead");
  }
}

export function markAboveAsRead(articleId) {
  return markArticleRangeAsRead(articleId, "above");
}

export function markBelowAsRead(articleId) {
  return markArticleRangeAsRead(articleId, "below");
}

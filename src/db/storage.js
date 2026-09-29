import Dexie from "dexie";

// 创建数据库
const db = new Dexie("minifluxReader");

// 创建表及索引
db.version(11).stores({
  articles:
    "id, feedId, status, starred, created_at, [status+feedId], [starred+feedId]",
  categories: "id, title",
  feeds: "id, url",
  feedIcons: "feedId",
});

db.open().catch((err) => {
  console.error("打开数据库失败:", err);
  // 如果是版本升级错误，尝试删除数据库并重新创建
  if (err.name === "VersionError" || err.name === "UpgradeError") {
    return db.delete().then(() => {
      console.log("数据库已重置");
      window.location.reload(); // 刷新页面重新初始化数据库
    });
  }
});

// 添加订阅源
async function addFeeds(feeds) {
  return db.feeds.bulkPut(feeds);
}

// 获取所有订阅源
async function getFeeds() {
  return db.feeds.toArray();
}

// 清空全部订阅源
async function deleteAllFeeds() {
  return db.feeds.clear();
}

// 删除指定的订阅源
async function deleteFeed(feedId) {
  return db.feeds.delete(feedId);
}

// 删除指定的订阅源图标
async function deleteFeedIcon(feedId) {
  return db.feedIcons.delete(feedId);
}

// 添加分类
async function addCategory(category) {
  return db.categories.put(category);
}

// 获取所有分类
async function getCategories() {
  return db.categories.toArray();
}

// 删除分类
async function deleteAllCategory() {
  return db.categories.clear();
}

// 删除单个分类
async function deleteCategory(categoryId) {
  return db.categories.delete(categoryId);
}

// 更新分类
async function updateCategory(categoryId, title) {
  return db.categories.update(categoryId, { title });
}

// 存储上次同步时间
function setLastSyncTime(time) {
  localStorage.setItem("lastSyncTime", time.toISOString());
}

// 获取上次同步时间
function getLastSyncTime() {
  const time = localStorage.getItem("lastSyncTime");
  return time ? new Date(time) : null;
}

// 批量添加文章
async function addArticles(articles) {
  return db.articles.bulkPut(articles);
}

// 将指定订阅源中的所有本地未读文章标记为已读。
async function markUnreadArticlesAsRead(feedIds) {
  const targetFeedIds = new Set(feedIds.map(Number));

  if (targetFeedIds.size === 0) {
    return 0;
  }

  return db.articles
    .where("status")
    .equals("unread")
    .and((article) => targetFeedIds.has(article.feedId))
    .modify({ status: "read" });
}

// 删除指定源的全部文章
async function deleteArticlesByFeedId(feedId) {
  return db.articles.where("feedId").equals(feedId).delete();
}

// 获取订阅源未读文章数量
async function getUnreadCount(feedId) {
  return db.articles
    .where(["status", "feedId"])
    .equals(["unread", feedId])
    .count();
}

// 获取订阅源收藏文章数量
async function getStarredCount(feedId) {
  return db.articles.where(["starred", "feedId"]).equals([1, feedId]).count();
}

// 获取文章总数
async function getArticlesCount(feedIds, filter = "all") {
  let query;

  switch (filter) {
    case "unread":
      query = db.articles
        .where("feedId")
        .anyOf(feedIds)
        .and((article) => article.status === "unread");
      break;
    case "starred":
      query = db.articles
        .where("feedId")
        .anyOf(feedIds)
        .and((article) => article.starred === 1);
      break;
    default:
      query = db.articles
        .where("feedId")
        .anyOf(feedIds)
        .and((article) => article.status !== "removed");
      break;
  }

  return query.count();
}

// 分页获取文章
async function getArticlesByPage(
  feedIds,
  filter = "all",
  page = 1,
  pageSize = 30,
  sortDirection = "desc",
  sortField = "published_at",
) {
  const offset = (page - 1) * pageSize;

  // 创建基础查询
  let collection;

  // 先应用过滤条件
  switch (filter) {
    case "unread":
      collection = db.articles
        .where("status")
        .equals("unread")
        .and((article) => feedIds.includes(article.feedId));
      break;
    case "starred":
      collection = db.articles
        .where("starred")
        .equals(1)
        .and((article) => feedIds.includes(article.feedId));
      break;
    default:
      collection = db.articles
        .where("feedId")
        .anyOf(feedIds)
        .and((article) => article.status !== "removed");
  }

  // 在过滤后的结果上进行排序
  collection = collection.sortBy(sortField);

  // 如果需要倒序，则反转结果
  return sortDirection === "desc"
    ? (await collection).reverse().slice(offset, offset + pageSize)
    : (await collection).slice(offset, offset + pageSize);
}

// 获取文章详情
async function getArticleById(id) {
  const article = await db.articles.get(parseInt(id));

  if (!article) {
    return null;
  }

  // 获取文章对应的订阅源
  const feed = await db.feeds.get(article.feedId);

  return {
    ...article,
    feed: feed,
  };
}

async function searchArticles(keyword, showHiddenFeeds = false, sortField = "published_at") {
  try {
    // 获取可见的订阅源ID
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
    console.error("搜索文章失败:", error);
    throw error;
  }
}

// 获取订阅源图标
async function getFeedIcon(feedId) {
  return db.feedIcons.get(feedId);
}

// 存储订阅源图标
async function setFeedIcon(feedIcon) {
  return db.feedIcons.put({
    ...feedIcon,
    updated_at: new Date().toISOString(),
  });
}

// 清理所有本地缓存数据（文章、订阅源、分类、图标）
async function clearAllData() {
  await Promise.all([
    db.articles.clear(),
    db.feeds.clear(),
    db.categories.clear(),
    db.feedIcons.clear(),
  ]);
  localStorage.removeItem("lastSyncTime");
}

export {
  addFeeds,
  getFeeds,
  deleteAllFeeds,
  deleteFeed,
  deleteFeedIcon,
  addCategory,
  getCategories,
  deleteAllCategory,
  deleteCategory,
  updateCategory,
  setLastSyncTime,
  getLastSyncTime,
  addArticles,
  markUnreadArticlesAsRead,
  deleteArticlesByFeedId,
  getUnreadCount,
  getStarredCount,
  getArticlesCount,
  getArticlesByPage,
  getArticleById,
  searchArticles,
  getFeedIcon,
  setFeedIcon,
  clearAllData,
};

import { atom } from "nanostores";
import minifluxAPI from "../api/miniflux";
import storage from "../db/storage";
import { extractTextFromHtml } from "@/lib/utils.js";

// 在线状态
export const isOnline = atom(navigator.onLine);
// 同步状态
export const isSyncing = atom(false);
export const lastSync = atom(null);
// 错误信息
export const error = atom(null);

// 全局定时器变量
let syncInterval = null;

// 监听在线状态
if (typeof window !== "undefined") {
  window.addEventListener("online", () => isOnline.set(true));
  window.addEventListener("offline", () => isOnline.set(false));
}

// 从miniflux同步订阅源并保存到数据库
async function syncFeeds() {
  try {
    // 获取服务器上的所有订阅源和分类
    const [serverFeeds, serverCategories] = await Promise.all([
      minifluxAPI.getFeeds(),
      minifluxAPI.getCategories(),
    ]);
    await storage.init();

    // 获取本地数据库中的所有订阅源
    const localFeeds = await storage.getFeeds();

    // 找出需要删除的订阅源（在本地存在但服务器上已不存在）
    const serverFeedIds = new Set(serverFeeds.map((feed) => feed.id));
    const feedsToDelete = localFeeds.filter(
      (feed) => !serverFeedIds.has(feed.id),
    );

    // 删除该订阅源的所有文章
    for (const feed of feedsToDelete) {
      await storage.deleteArticlesByFeedId(feed.id);
    }

    // 清空本地订阅源和分类数据
    await Promise.all([
      storage.deleteAllFeeds(),
      storage.deleteAllCategories(),
    ]);

    // 同步分类数据
    for (const category of serverCategories) {
      await storage.addCategory({
        id: category.id,
        title: category.title,
      });
    }

    // 重置现有订阅源
    for (const feed of serverFeeds) {
      await storage.addFeed({
        id: feed.id,
        title: feed.title,
        url: feed.feed_url,
        site_url: feed.site_url,
        crawler: feed.crawler,
        hide_globally: feed.hide_globally,
        categoryId: feed.category.id,
        categoryName: feed.category.title,
      });
    }

    return serverFeeds;
  } catch (error) {
    console.error("同步订阅源失败:", error);
    throw error;
  }
}

// 从miniflux同步文章并保存到数据库
async function syncEntries() {
  try {
    const lastSyncTime = storage.getLastSyncTime();
    // 计算24小时前的时间戳
    const oneDayAgo = new Date(lastSyncTime);
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    if (!lastSyncTime) {
      // 首次同步,获取所有非星标文章
      const feeds = await storage.getFeeds();
      for (const feed of feeds) {
        const entries = await minifluxAPI.getFeedEntries(feed.id, {
          starred: false,
        });
        await storage.addArticles(
          entries.map((entry) => ({
            id: entry.id,
            feedId: feed.id,
            title: entry.title,
            author: entry.author,
            url: entry.url,
            content: entry.content,
            plainContent: extractTextFromHtml(entry.content),
            status: entry.status,
            starred: entry.starred,
            published_at: entry.published_at,
            created_at: entry.created_at,
            enclosures: entry.enclosures || [],
          })),
        );
      }
      // 获取星标文章
      const starredEntries = await minifluxAPI.getAllStarredEntries();
      await storage.addArticles(
        starredEntries.map((entry) => ({
          id: entry.id,
          feedId: entry.feed.id,
          title: entry.title,
          author: entry.author,
          url: entry.url,
          content: entry.content,
          plainContent: extractTextFromHtml(entry.content),
          status: entry.status,
          starred: entry.starred,
          published_at: entry.published_at,
          created_at: entry.created_at,
          enclosures: entry.enclosures || [],
        })),
      );
    } else {
      // 增量同步
      // 1. 获取变更的文章
      const changedEntries = await minifluxAPI.getChangedEntries(oneDayAgo);
      if (changedEntries.length > 0) {
        await storage.addArticles(
          changedEntries.map((entry) => ({
            id: entry.id,
            feedId: entry.feed.id,
            title: entry.title,
            author: entry.author,
            url: entry.url,
            content: entry.content,
            plainContent: extractTextFromHtml(entry.content),
            status: entry.status,
            starred: entry.starred,
            published_at: entry.published_at,
            created_at: entry.created_at,
            enclosures: entry.enclosures || [],
          })),
        );
      }

      // 2. 获取新发布的文章
      const newEntries = await minifluxAPI.getNewEntries(oneDayAgo);
      if (newEntries.length > 0) {
        await storage.addArticles(
          newEntries.map((entry) => ({
            id: entry.id,
            feedId: entry.feed.id,
            title: entry.title,
            author: entry.author,
            url: entry.url,
            content: entry.content,
            plainContent: extractTextFromHtml(entry.content),
            status: entry.status,
            starred: entry.starred,
            published_at: entry.published_at,
            created_at: entry.created_at,
            enclosures: entry.enclosures || [],
          })),
        );
      }
    }
  } catch (error) {
    console.error("同步文章失败:", error);
    throw error;
  }
}

// 执行完整同步
export async function sync() {
  // 如果网络不在线或正在同步，则不执行同步
  if (!isOnline.get() || isSyncing.get()) return;

  // 设置同步状态为正在同步
  isSyncing.set(true);
  error.set(null);
  console.log("执行同步");

  try {
    // 同步订阅源并保存到数据库
    await syncFeeds();
    // 同步文章并保存到数据库
    await syncEntries();
    // 设置最后同步时间
    const now = new Date();
    storage.setLastSyncTime(now);
    lastSync.set(now);
  } catch (err) {
    error.set(err);
  } finally {
    // 设置同步状态为未同步
    isSyncing.set(false);
  }
}

// 启动自动同步
export function startAutoSync() {
  if (typeof window === "undefined") return;

  // 执行初始同步
  performSync();

  //打印
  console.log("启动后台刷新。");

  // 设置定时器
  syncInterval = setInterval(performSync, 5 * 60 * 1000);

  // 添加清理函数
  window.addEventListener("beforeunload", stopAutoSync);
}

// 停止自动同步
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  window.removeEventListener("beforeunload", stopAutoSync);
}

// 同步函数
async function performSync() {
  if (isOnline.get() && !isSyncing.get()) {
    try {
      const lastSyncTime = storage.getLastSyncTime();
      const now = new Date();
      if (!lastSyncTime || now - lastSyncTime > 5 * 60 * 1000) {
        await sync();
      }
    } catch (error) {
      console.error("自动同步失败:", error);
    }
  }
}

// 手动强制同步,由侧边栏刷新按钮触发
export async function forceSync() {
  if (isOnline.get() && !isSyncing.get()) {
    try {
      await sync();
    } catch (error) {
      console.error("强制同步失败:", error);
    }
  }
}

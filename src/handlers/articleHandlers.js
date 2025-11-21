import {
  activeArticle,
  updateArticleStarred,
  updateArticleStatus,
  markAllAsRead,
  markAboveAsRead,
  markBelowAsRead,
  loadingOriginContent,
} from "../stores/articlesStore.js";
import minifluxAPI from "@/api/miniflux";

// 处理文章状态更新
export const handleMarkStatus = async (article) => {
  try {
    await updateArticleStatus(article);
  } catch (err) {
    console.error("更新文章状态失败:", err);
  }
};

// 处理文章星标状态更新
export const handleToggleStar = async (article) => {
  try {
    await updateArticleStarred(article);
  } catch (err) {
    console.error("更新文章星标状态失败:", err);
  }
};

// 处理标记所有文章为已读
export const handleMarkAllRead = async (type, id) => {
  try {
    switch (type) {
      case "feed":
        await markAllAsRead("feed", id);
        break;
      case "category":
        await markAllAsRead("category", id);
        break;
      default:
        await markAllAsRead();
    }
  } catch (err) {
    console.error("标记已读失败:", err);
  }
};

// 处理标记上方文章为已读
export const handleMarkAboveAsRead = async (articleId) => {
  try {
    await markAboveAsRead(articleId);
  } catch (err) {
    console.error("标记上方为已读失败:", err);
  }
};

// 处理标记下方文章为已读
export const handleMarkBelowAsRead = async (articleId) => {
  try {
    await markBelowAsRead(articleId);
  } catch (err) {
    console.error("标记下方为已读失败:", err);
  }
};

// 处理内容切换
export const handleToggleContent = async (article) => {
  if (!article || loadingOriginContent.get()) return;

  try {
    loadingOriginContent.set(true);
    const showOriginal = !article.shownOriginal;

    activeArticle.set({
      ...article,
      content: showOriginal
        ? await minifluxAPI.fetchEntryContent(article.id)
        : article.originalContent,
      shownOriginal: showOriginal,
    });
  } catch (error) {
    console.error("切换内容失败:", error);
  } finally {
    loadingOriginContent.set(false);
  }
};

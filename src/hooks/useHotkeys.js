import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import {
  activeArticle,
  filteredArticles,
  imageGalleryActive,
} from "@/stores/articlesStore";
import {
  handleMarkStatus,
  handleToggleStar,
  handleToggleContent,
} from "@/handlers/articleHandlers";
import { forceSync } from "@/stores/syncStore";
import {
  searchDialogOpen,
  addFeedModalOpen,
  shortcutsModalOpen,
} from "@/stores/modalStore.js";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import { settingsState } from "@/stores/settingsStore.js";

export function useHotkeys() {
  const navigate = useNavigate();
  const $articles = useStore(filteredArticles);
  const $activeArticle = useStore(activeArticle);
  const { markAsReadOnScroll } = useStore(settingsState);
  const $imageGalleryActive = useStore(imageGalleryActive);
  const { articleId } = useParams();
  const { navigateToPrevious, navigateToNext, toggleCurrentCategory } =
    useSidebarNavigation();

  // 获取当前文章在列表中的索引
  const currentIndex = $articles.findIndex((a) => a.id === $activeArticle?.id);

  const basePath = window.location.pathname
    .split("/article/")[0]
    .replace(/\/$/, "");

  useEffect(() => {
    const handleKeyDown = async (e) => {
      // 如果焦点在输入框中,不触发快捷键
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        shortcutsModalOpen.set(!shortcutsModalOpen.get());
        return;
      }

      if (e.key === "N" && e.shiftKey) {
        e.preventDefault();
        addFeedModalOpen.set(!addFeedModalOpen.get());
        return;
      }


      switch (e.key.toLowerCase()) {
        case "f": // 搜索
          e.preventDefault();
          searchDialogOpen.set(true);
          break;

        case "j": // 下一篇
          if (!articleId) {
            if ($articles.length === 0) {
              return;
            }
            const nextArticle = $articles[0];
            navigate(`${basePath}/article/${nextArticle.id}`);
            if (nextArticle.status !== "read" && markAsReadOnScroll) {
              await handleMarkStatus(nextArticle);
            }
          } else if (currentIndex < $articles.length - 1) {
            const nextArticle = $articles[currentIndex + 1];
            navigate(`${basePath}/article/${nextArticle.id}`);
            if (nextArticle.status !== "read" && markAsReadOnScroll) {
              await handleMarkStatus(nextArticle);
            }
          }
          break;

        case "k": // 上一篇
          if (currentIndex > 0) {
            const prevArticle = $articles[currentIndex - 1];
            navigate(`${basePath}/article/${prevArticle.id}`);
            if (prevArticle.status !== "read" && markAsReadOnScroll) {
              await handleMarkStatus(prevArticle);
            }
          }
          break;

        case "m": // 标记已读/未读
          if (articleId) {
            await handleMarkStatus($activeArticle);
          }
          break;

        case "s": // 收藏/取消收藏
          if (articleId) {
            await handleToggleStar($activeArticle);
          }
          break;

        case "r": // 刷新
          if (!e.ctrlKey && !e.metaKey) {
            await forceSync();
          }
          break;

        case "escape": // 关闭文章
          if ($imageGalleryActive) {
            return;
          } else {
            navigate(basePath || "/");
          }
          break;

        case "v": // 在新标签页打开原文
          if (articleId) {
            window.open($activeArticle.url, "_blank");
          }
          break;

        case "g": // 原文/摘要切换
          if (articleId) {
            await handleToggleContent($activeArticle);
          }
          break;

        case "p": // 上一个订阅或分组
          e.preventDefault();
          navigateToPrevious();
          break;

        case "n": // 下一个订阅或分组
          e.preventDefault();
          navigateToNext();
          break;

        case "x": // 切换分组展开状态
          e.preventDefault();
          toggleCurrentCategory();
          break;

        default:
          break;
      }
    };

    const target = window;
    target.addEventListener("keydown", handleKeyDown);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    $activeArticle,
    currentIndex,
    $articles,
    basePath,
    navigate,
    articleId,
    $imageGalleryActive,
    markAsReadOnScroll,
    navigateToPrevious,
    navigateToNext,
    toggleCurrentCategory,
  ]);
}

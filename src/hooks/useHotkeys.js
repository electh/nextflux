import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { categoriesAndFeeds } from "@/stores/feedsStore.js";
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
import { toggleCategoryExpanded } from "@/handlers/feedHandlers";
import { forceSync } from "@/stores/syncStore";
import {
  searchDialogOpen,
  addFeedModalOpen,
  shortcutsModalOpen,
} from "@/stores/modalStore.js";

export function useHotkeys() {
  const navigate = useNavigate();
  const $articles = useStore(filteredArticles);
  const $activeArticle = useStore(activeArticle);
  const $imageGalleryActive = useStore(imageGalleryActive);
  const { categoryId, feedId, articleId } = useParams();
  const $categoriesAndFeeds = useStore(categoriesAndFeeds);

  const currentCatFeedIndex = $categoriesAndFeeds.findIndex(
    // certain feed only can be in one category
    // NOTE: cid is string, fid is number
    (i) =>
      // when categoryId is undefined, it means currently selected certain feed
      (categoryId === undefined && `${i.fid}` === feedId) ||
      // when i.fid is undefined, it means currently selected certain category
      (i.cid === categoryId && i.fid === undefined)
  );

  // 获取当前文章在列表中的索引
  const currentIndex = $articles.findIndex((a) => a.id === $activeArticle?.id);

  // 获取当前路径并去掉 article 部分
  const basePath = window.location.pathname.split("/article/")[0];

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
      }

      if (e.key === "N" && e.shiftKey) {
        e.preventDefault();
        addFeedModalOpen.set(!addFeedModalOpen.get());
      }

      switch (e.key.toLowerCase()) {
        case "f": // 搜索
          e.preventDefault();
          searchDialogOpen.set(true);
          break;

        case "N": // 新建订阅源
          addFeedModalOpen.set(true);
          break;

        case "x":
          toggleCategoryExpanded($categoriesAndFeeds[currentCatFeedIndex]?.cid);
          // when currently selected feed, collapse category will go to the category of the feed
          if (categoryId === undefined) {
            navigate(
              `/category/${$categoriesAndFeeds[currentCatFeedIndex]?.cid}`
            );
          }
          break;

        case "n": {
          // next category or feed
          // if current is category: when collapsed then select next category
          // when expanded then select first feed of current category

          // if current is feed, find next feed
          // when it's the last feed of the category, select next category
          // check any selected category or feed
          const nextCategoryOrFeed =
            $categoriesAndFeeds[currentCatFeedIndex + 1];
          if (nextCategoryOrFeed) {
            const { fid, cid } = nextCategoryOrFeed;
            const type = fid ? "feed" : "category";
            const id = fid ?? cid;

            navigate(`/${type}/${id}`);
          }
          break;
        }

        case "p": {
          // previous category or feed
          const prevCategoryOrFeed =
            $categoriesAndFeeds[currentCatFeedIndex - 1];
          if (prevCategoryOrFeed) {
            const { fid, cid } = prevCategoryOrFeed;
            const type = fid ? "feed" : "category";
            const id = fid ?? cid;

            navigate(`/${type}/${id}`);
          }
          break;
        }

        case "j": {
          // 下一篇
          const nextArticleIndex =
            articleId === undefined || currentIndex >= $articles.length - 1
              ? 0
              : currentIndex + 1;
          const nextArticle = $articles[nextArticleIndex];
          navigate(`${basePath}/article/${nextArticle.id}`);
          if (nextArticle.status !== "read") {
            await handleMarkStatus(nextArticle);
          }
          break;
        }

        case "k": // 上一篇
          // TODO: when no article opened, should open the last one
          // but $articles is not full list, instead of paginated list
          if (currentIndex > 0) {
            const prevArticle = $articles[currentIndex - 1];
            navigate(`${basePath}/article/${prevArticle.id}`);
            if (prevArticle.status !== "read") {
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
    $categoriesAndFeeds,
    categoryId,
    feedId,
    currentCatFeedIndex,
  ]);
}

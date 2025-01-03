import { useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { lastSync } from "@/stores/syncStore.js";
import {
  filter,
  filteredArticles,
  loadArticles,
} from "@/stores/articlesStore.js";
import { Outlet, useLocation, useParams } from "react-router-dom";
import ArticleListHeader from "./components/ArticleListHeader";
import ArticleListContent from "./components/ArticleListContent";
import ArticleListFooter from "./components/ArticleListFooter";
import EmptyPlaceholder from "./components/EmptyPlaceholder";
import { settingsState } from "@/stores/settingsStore.js";

const ArticleList = () => {
  const { feedId, categoryId, articleId } = useParams();
  const $filteredArticles = useStore(filteredArticles);
  const $lastSync = useStore(lastSync);
  const $filter = useStore(filter);
  const { sortDirection, showHiddenFeeds } = useStore(settingsState);
  const location = useLocation();
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const loadAndFilterArticles = () => {
      if (feedId) {
        loadArticles(feedId, "feed");
      } else if (categoryId) {
        loadArticles(categoryId, "category");
      } else {
        loadArticles();
      }
    };

    loadAndFilterArticles();
  }, [feedId, categoryId, $lastSync, $filter, sortDirection, showHiddenFeeds]);

  useEffect(() => {
    if (scrollAreaRef.current && articleId) {
      const viewport = scrollAreaRef.current.querySelector(".v-list");
      const articleCard = viewport?.querySelector(
        `[data-article-id="${articleId}"]`,
      );

      if (viewport && articleCard) {
        const viewportRect = viewport.getBoundingClientRect();
        const cardRect = articleCard.getBoundingClientRect();

        // 考虑 header 和 footer 的高度
        const headerHeight = 64; // header 高度
        const footerHeight = 64; // footer 高度

        // 计算实际可视区域
        const effectiveViewportTop = viewportRect.top + headerHeight;
        const effectiveViewportBottom = viewportRect.bottom - footerHeight;

        // 检查文章卡片是否在有效视口内
        const isCardInViewport =
          cardRect.top >= effectiveViewportTop &&
          cardRect.bottom <= effectiveViewportBottom;

        // 如果卡片不在有效视口内，才进行滚动
        if (!isCardInViewport) {
          // 如果卡片在视口上方，滚动到顶部对齐（考虑 header）
          if (cardRect.top < effectiveViewportTop) {
            viewport.scrollTo({
              top: viewport.scrollTop + (cardRect.top - effectiveViewportTop),
              behavior: "smooth",
            });
          }
          // 如果卡片在视口下方，滚动到底部对齐（考虑 footer）
          else if (cardRect.bottom > effectiveViewportBottom) {
            viewport.scrollTo({
              top:
                viewport.scrollTop +
                (cardRect.bottom - effectiveViewportBottom),
              behavior: "smooth",
            });
          }
        }
      }
    }
  }, [articleId]);

  // 监听 feedId、categoryId 和 filter 变化，滚动到顶部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(".v-list");
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [feedId, categoryId, $filter]);

  return (
    <div className="main-content flex bg-content2">
      <div
        ref={scrollAreaRef}
        className="w-full relative max-w-[100vw] sm:w-[21rem] sm:max-w-[30%] sm:min-w-[18rem] h-[100dvh] bg-content2 flex flex-col sm:border-r"
      >
        <ArticleListHeader />
        <ArticleListContent articles={$filteredArticles} />
        <ArticleListFooter />
      </div>
      {!location.pathname.includes("/article/") ? (
        <EmptyPlaceholder />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default ArticleList;

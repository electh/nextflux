import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  filter,
  filteredArticles,
  hasMore,
  currentPage,
  loading,
  loadingMore,
  visibleRange,
} from "@/stores/articlesStore.js";
import { useLiveQuery } from "dexie-react-hooks";
import { loadArticlePage } from "@/services/articleService.js";
import { reconcileRecords } from "@/domain/sync/reconcileRecords.js";
import { computed } from "nanostores";
import { db } from "@/db/database.js";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ArticleListHeader from "./components/ArticleListHeader";
import ArticleListContent from "./components/ArticleListContent";
import ArticleListFooter from "./components/ArticleListFooter";
import { settingsState } from "@/stores/settingsStore.js";
import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { reportError } from "@/lib/errors.js";
import ArticleView from "@/components/ArticleView/ArticleView.jsx";
const atTop = computed(visibleRange, (range) => range.startIndex === 0);
const ArticleList = () => {
  const { t } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const { feedId, categoryId, articleId } = useParams();
  const $filteredArticles = useStore(filteredArticles);
  const $filter = useStore(filter);
  const $currentPage = useStore(currentPage);
  const $atTop = useStore(atTop);
  const { sortDirection, sortField, showHiddenFeeds } =
    useStore(settingsState);
  const virtuosoRef = useRef(null);
  const { isMedium } = useIsMobile();
  // 判断是否在移动端且正在查看文章详情
  const isArticleDetailOpen = isMedium && !!articleId;
  const scope = JSON.stringify([
    feedId,
    categoryId,
    $filter,
    sortDirection,
    sortField,
    showHiddenFeeds,
  ]);
  const previousScope = useRef(null);
  const result = useLiveQuery(async () => {
    try {
      const retained = await db.articles.bulkGet(
        filteredArticles.get().map(({ id }) => id),
      );
      return {
        scope,
        retained: retained.filter(Boolean),
        ...(await loadArticlePage({
          sourceId: feedId || categoryId,
          type: feedId ? "feed" : categoryId ? "category" : "all",
          page: 1,
          pageSize: $currentPage * 30,
          filter: $filter,
          settings: { sortDirection, sortField, showHiddenFeeds },
        })),
      };
    } catch (error) {
      reportError(error, "articles.listLoad");
      return { scope, articles: [], isMore: false };
    }
  }, [
    scope,
    feedId,
    categoryId,
    $filter,
    sortDirection,
    sortField,
    showHiddenFeeds,
    $currentPage,
  ]);

  useEffect(() => {
    if (previousScope.current !== scope) {
      previousScope.current = scope;
      filteredArticles.set([]);
      currentPage.set(1);
      visibleRange.set({ startIndex: 0, endIndex: 0 });
      loading.set(true);
      setPendingCount(0);
    }
    if (!result || result.scope !== scope) return;
    const previous = filteredArticles.get();
    // While scrolling, patch rows in place. Apply insertions/removals when back at top.
    const byId = new Map(
      [...(result.retained || []), ...result.articles].map((article) => [
        article.id,
        article,
      ]),
    );
    const knownIds = new Set(previous.map(({ id }) => id));
    const firstKnownIndex = result.articles.findIndex(({ id }) =>
      knownIds.has(id),
    );
    setPendingCount(
      !$atTop && previous.length
        ? firstKnownIndex < 0
          ? result.articles.length
          : firstKnownIndex
        : 0,
    );
    let incoming = result.articles;
    if (!$atTop && previous.length) {
      const lastIndex = result.articles.findIndex(
        ({ id }) => id === previous.at(-1).id,
      );
      const existingIds = new Set(previous.map(({ id }) => id));
      incoming = [
        ...previous.map((article) => byId.get(article.id) || article),
        ...result.articles
          .slice(lastIndex < 0 ? result.articles.length : lastIndex + 1)
          .filter(({ id }) => !existingIds.has(id)),
      ];
    }
    filteredArticles.set(reconcileRecords(previous, incoming));
    hasMore.set(result.isMore);
    loading.set(false);
    loadingMore.set(false);
  }, [result, scope, $atTop]);
  const setVisibleRange = useCallback((range) => visibleRange.set(range), []);

  return (
    <div className="main-content flex w-full min-w-0 bg-sidebar">
      <div
        className={cn(
          "motion-sensitive shrink-0 w-full relative max-w-screen md:w-84 md:max-w-[30%] md:min-w-[18rem] h-dvh flex flex-col",
          // iOS 风格动画：移动端查看文章详情时，列表向左移动
          isArticleDetailOpen && "article-list-shifted",
        )}
      >
        <ArticleListHeader />
        {pendingCount > 0 && (
          <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-10">
            <Button
              size="sm"
              variant="secondary"
              className="pointer-events-auto shadow-sm rounded-full"
              onClick={() => {
                visibleRange.set({ startIndex: 0, endIndex: 0 });
                virtuosoRef.current?.scrollToIndex({
                  index: 0,
                  behavior: "auto",
                });
              }}
            >
              <ArrowUp data-icon="inline-start" />
              {t("common.newArticles", { count: pendingCount })}
            </Button>
          </div>
        )}
        <ArticleListContent
          articles={$filteredArticles}
          virtuosoRef={virtuosoRef}
          setVisibleRange={setVisibleRange}
        />
        <ArticleListFooter />
      </div>
      <ArticleView />
    </div>
  );
};
export default ArticleList;

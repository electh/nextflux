import { Button } from "@/components/ui/button";
import { memo, useEffect, useMemo } from "react";
import ArticleCard from "./ArticleCard";
import { useParams } from "react-router-dom";
import {
  filter,
  hasMore,
  currentPage,
  loadingMore,
  loading,
} from "@/stores/articlesStore.js";
import { useStore } from "@nanostores/react";
import { Virtuoso } from "react-virtuoso";
import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { CheckCheck, Loader2 } from "lucide-react";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { isSyncing } from "@/stores/syncStore.js";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.js";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
const ArticleItem = memo(({ article, isLast }) => (
  <div className="mx-2">
    <ArticleCard article={article} />
    {!isLast && <div className="h-4" />}
  </div>
));
ArticleItem.displayName = "ArticleItem";
const ListHeader = () => <div className="vlist-header h-2" />;
function ListFooter({
  context: { feedId, categoryId, $filter, $isSyncing, $loadingMore },
}) {
  const { t } = useTranslation();
  return (
    <div className="vlist-footer h-24 pt-2 px-2">
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        disabled={$filter === "starred"}
        onClick={() =>
          handleMarkAllRead(
            feedId ? "feed" : categoryId ? "category" : "all",
            feedId || categoryId,
          )
        }
      >
        {$isSyncing || $loadingMore ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <CheckCheck data-icon="inline-start" />
        )}
        {t("articleList.markAllRead")}
      </Button>
    </div>
  );
}
const listComponents = { Header: ListHeader, Footer: ListFooter };
export default function ArticleListContent({
  articles,
  setVisibleRange,
  virtuosoRef,
}) {
  const { feedId, categoryId, articleId } = useParams();
  const $filter = useStore(filter);
  const $isSyncing = useStore(isSyncing);
  const { isMedium } = useIsMobile();
  const index = articles.findIndex(
    (article) => article.id === parseInt(articleId),
  );
  const $hasMore = useStore(hasMore);
  const $loading = useStore(loading);
  const $loadingMore = useStore(loadingMore);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (isMedium) {
      return;
    }
    if (index >= 0) {
      virtuosoRef.current?.scrollIntoView({
        index: index,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [isMedium, index, reduceMotion, virtuosoRef]);
  const handleEndReached = () => {
    if (!$hasMore || loadingMore.get()) return;
    loadingMore.set(true);
    currentPage.set(currentPage.get() + 1);
  };
  const context = useMemo(
    () => ({
      feedId,
      categoryId,
      $filter,
      $isSyncing,
      $loadingMore,
    }),
    [feedId, categoryId, $filter, $isSyncing, $loadingMore],
  );
  return (
    <div className="h-full">
      {$loading ? (
        <Loader2 className="size-4 animate-spin mx-auto mt-3 text-primary" />
      ) : (
        <div
          className={cn(
            "motion-sensitive article-list-content flex-1 h-full",
            reduceMotion
              ? ""
              : " animate-in duration-400 fade-in slide-in-from-bottom-12 ease-in-out",
          )}
        >
          <Virtuoso
            ref={virtuosoRef}
            className="v-list h-full"
            overscan={{
              main: 2,
              reverse: 0,
            }}
            data={articles}
            rangeChanged={setVisibleRange}
            context={context}
            computeItemKey={(_, article) => article.id}
            totalCount={articles.length}
            endReached={handleEndReached}
            components={listComponents}
            itemContent={(index, article) => (
              <ArticleItem
                key={article.id}
                article={article}
                isLast={index === articles.length - 1}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

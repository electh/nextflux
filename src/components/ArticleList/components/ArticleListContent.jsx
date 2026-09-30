import { Button } from "@/components/ui/button";
import { memo, useEffect } from "react";
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
import { loadArticles } from "@/stores/articlesStore";
import { cn } from "@/lib/utils.js";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
const ArticleItem = memo(({ article, isLast }) => (
  <div className="mx-2">
    <ArticleCard article={article} />
    {!isLast && <div className="h-4" />}
  </div>
));
ArticleItem.displayName = "ArticleItem";
export default function ArticleListContent({
  articles,
  setVisibleRange,
  virtuosoRef,
}) {
  const { t } = useTranslation();
  const { feedId, categoryId, articleId } = useParams();
  const $filter = useStore(filter);
  const $isSyncing = useStore(isSyncing);
  const { isMedium } = useIsMobile();
  const index = articles.findIndex(
    (article) => article.id === parseInt(articleId),
  );
  const $hasMore = useStore(hasMore);
  const $currentPage = useStore(currentPage);
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
  const handleEndReached = async () => {
    if (!$hasMore || $loadingMore) return;
    try {
      loadingMore.set(true);
      const nextPage = $currentPage + 1;
      if (feedId) {
        await loadArticles(feedId, "feed", nextPage, true);
      } else if (categoryId) {
        await loadArticles(categoryId, "category", nextPage, true);
      } else {
        await loadArticles(null, null, nextPage, true);
      }
    } finally {
      loadingMore.set(false);
    }
  };
  return (
    <div className="h-full">
      {$loading ? (
        <Loader2 className="size-4 animate-spin mx-auto mt-3 text-accent" />
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
            context={{
              feedId,
              categoryId,
              $filter,
              $isSyncing,
              handleMarkAllRead,
            }}
            totalCount={articles.length}
            endReached={handleEndReached}
            components={{
              Header: () => <div className="vlist-header h-2"></div>,
              Footer: ({
                context: {
                  feedId,
                  categoryId,
                  $filter,
                  $isSyncing,
                  handleMarkAllRead,
                },
              }) => (
                <div className="vlist-footer h-24 pt-2 px-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (feedId) {
                        handleMarkAllRead("feed", feedId);
                      } else if (categoryId) {
                        handleMarkAllRead("category", categoryId);
                      } else {
                        handleMarkAllRead();
                      }
                    }}
                    disabled={$filter === "starred"}
                    className={cn("w-full", "text-muted-foreground")}
                  >
                    {$isSyncing || $loadingMore ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCheck className="size-4" />
                    )}
                    {t("articleList.markAllRead")}
                  </Button>
                </div>
              ),
            }}
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

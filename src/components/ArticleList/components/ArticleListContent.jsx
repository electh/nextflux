import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { Button, CircularProgress } from "@heroui/react";
import { CheckCheck, Loader2 } from "lucide-react";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { forceSync, isSyncing } from "@/stores/syncStore.js";
import { useTranslation } from "react-i18next";
import { loadArticles } from "@/stores/articlesStore";
import { settingsState } from "@/stores/settingsStore.js";
import { cn } from "@/lib/utils.js";

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
  const { reduceMotion } = useStore(settingsState);

  // pull-to-refresh state (compact pointer-only impl)
  const scrollerRef = useRef(null);
  const cleanupRef = useRef(null);
  const overlayRef = useRef(null);
  const overlayHRef = useRef(28);
  const pullingRef = useRef(false);
  const startYRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const pullDistanceRef = useRef(0);
  const pullTypeRef = useRef(null); // 'pointer' | 'touch'
  useEffect(() => { pullDistanceRef.current = pullDistance; }, [pullDistance]);
  const PULL_MAX = 96;       // px
  const PULL_THRESHOLD = 56; // px
  const PULL_START = 8;      // px to start a pull

  // Measure overlay spinner height once; keep it hidden above the top initially
  useLayoutEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;
    const h = ov.offsetHeight || 0;
    if (h) overlayHRef.current = h;
    ov.style.transform = `translateY(-${overlayHRef.current}px)`;
    ov.style.opacity = "1";
  }, []);

  // Keep overlay visible while syncing; hide after sync completes (if not currently pulling)
  useEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;
    if ($isSyncing) {
      ov.style.transition = "";
      ov.style.transform = "translateY(0)";
    } else if (!pullingRef.current) {
      const h = overlayHRef.current || ov.offsetHeight || 0;
      ov.style.transition = "transform 150ms ease";
      ov.style.transform = `translateY(-${h}px)`;
      setTimeout(() => { if (ov) ov.style.transition = ""; }, 180);
    }
  }, [$isSyncing]);

  useEffect(() => {
    if (isMedium) {
      return;
    }
    if (index >= 0) {
      virtuosoRef.current?.scrollIntoView({
        index: index,
        behavior: "smooth",
      });
    }
  }, [isMedium, index, virtuosoRef]);

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
        <CircularProgress
          aria-label="Loading..."
          classNames={{
            base: "mx-auto p-3 animate-in fade-in",
            svg: "w-5 h-5",
          }}
        />
      ) : (
        <div
          className={cn(
            "article-list-content relative flex-1 h-full overflow-hidden",
            reduceMotion
              ? ""
              : " animate-in duration-400 fade-in slide-in-from-bottom-12 ease-in-out",
          )}
        >
          {/* Overlay spinner pulled over the list (under the list header) */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-8 flex items-center justify-center"
            style={{ transform: `translateY(-${overlayHRef.current}px)` }}
          >
            <CircularProgress aria-label="Refreshing..." classNames={{ svg: "w-4 h-4" }} />
          </div>
          <Virtuoso
            ref={virtuosoRef}
            className="v-list h-full"
            scrollerRef={(ref) => {
              // clean up any previous listeners
              if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
              }

              scrollerRef.current = ref;
              if (!ref) return;

              // allow vertical touch panning; this helps pointer events cooperate on mobile
              ref.style.touchAction = "pan-y";
              // avoid browser-level pull-to-refresh and scroll chaining
              ref.style.overscrollBehaviorY = "contain";

              // content is stationary; overlay handles the visual pull

              // compact pointer handlers
              const originalTouchAction = ref.style.touchAction;
              const setOverlay = (y) => {
                const ov = overlayRef.current;
                if (!ov) return;
                const h = overlayHRef.current || ov.offsetHeight || 0;
                const t = Math.max(0, y || 0); // incoming is already damped
                const translate = Math.min(0, t - h);
                ov.style.transform = `translateY(${translate}px)`;
              };
              const startPull = (y, type) => {
                pullingRef.current = true;
                // disable native vertical scrolling while pulling
                ref.style.touchAction = "none";
                startYRef.current = y;
                pullTypeRef.current = type;
                // performance and layering hints
                const ov = overlayRef.current;
                if (ov) { ov.style.willChange = "transform"; ov.style.opacity = "1"; }
              };
              const endPull = async () => {
                const distance = pullDistanceRef.current;
                pullingRef.current = false;
                setPullDistance(0);
                if (distance >= PULL_THRESHOLD) {
                  try { await forceSync(); } catch (err) { console.error("Force sync failed", err); }
                }
                // settle overlay
                const ov = overlayRef.current;
                if (ov) {
                  const h = overlayHRef.current || ov.offsetHeight || 0;
                  ov.style.transition = "transform 150ms ease";
                  if (distance >= PULL_THRESHOLD) {
                    ov.style.transform = "translateY(0)"; // stay visible and spin while syncing
                  } else {
                    ov.style.transform = `translateY(-${h}px)`; // hide
                    setTimeout(() => { if (ov) { ov.style.transition = ""; ov.style.willChange = ""; } }, 180);
                  }
                }
                // restore
                ref.style.touchAction = originalTouchAction || "pan-y";
                pullTypeRef.current = null;
              };
              const onPointerDown = (e) => { startYRef.current = e.clientY; };
              const onPointerMove = (e) => {
                if (pullTypeRef.current && pullTypeRef.current !== 'pointer') return;
                const delta = e.clientY - startYRef.current;
                if (!pullingRef.current) {
                  if (delta > PULL_START && ref.scrollTop <= 1) startPull(e.clientY, 'pointer');
                  else return;
                }
                if (ref.scrollTop > 0) { pullingRef.current = false; setPullDistance(0); setOverlay(0); return; }
                if (delta > 0) {
                  const damped = Math.min(PULL_MAX, delta * 0.5);
                  if (Math.abs(damped - pullDistanceRef.current) >= 1) setPullDistance(damped);
                  if (e.cancelable) e.preventDefault();
                  setOverlay(damped);
                } else { setPullDistance(0); setOverlay(0); }
              };
              const onPointerUp = () => endPull();
              const onPointerCancel = () => endPull();

              ref.addEventListener("pointerdown", onPointerDown, { passive: true });
              ref.addEventListener("pointermove", onPointerMove, { passive: false });
              ref.addEventListener("pointerup", onPointerUp);
              ref.addEventListener("pointercancel", onPointerCancel);

              // Touch fallback (helps iOS Safari where PointerEvents can be flaky)
              const onTouchStart = (e) => {
                startYRef.current = e.touches[0]?.clientY ?? 0;
              };
              const onTouchMove = (e) => {
                if (pullTypeRef.current && pullTypeRef.current !== 'touch') return;
                const y = e.touches[0]?.clientY ?? 0;
                const delta = y - startYRef.current;
                if (!pullingRef.current) {
                  if (delta > PULL_START && ref.scrollTop <= 1) startPull(y, 'touch');
                  else return;
                }
                if (ref.scrollTop > 0) { pullingRef.current = false; setPullDistance(0); setOverlay(0); return; }
                if (delta > 0) {
                  const damped = Math.min(PULL_MAX, delta * 0.5);
                  if (Math.abs(damped - pullDistanceRef.current) >= 1) setPullDistance(damped);
                  // prevent native rubber-band while pulling
                  if (e.cancelable) e.preventDefault();
                  setOverlay(damped);
                } else { setPullDistance(0); setOverlay(0); }
              };
              const onTouchEnd = () => endPull();
              const onTouchCancel = () => endPull();
              ref.addEventListener('touchstart', onTouchStart, { passive: true });
              ref.addEventListener('touchmove', onTouchMove, { passive: false });
              ref.addEventListener('touchend', onTouchEnd);
              ref.addEventListener('touchcancel', onTouchCancel);

              // store cleanup for the next ref change
              cleanupRef.current = () => {
                ref.removeEventListener("pointerdown", onPointerDown);
                ref.removeEventListener("pointermove", onPointerMove);
                ref.removeEventListener("pointerup", onPointerUp);
                ref.removeEventListener("pointercancel", onPointerCancel);
                ref.removeEventListener('touchstart', onTouchStart);
                ref.removeEventListener('touchmove', onTouchMove);
                ref.removeEventListener('touchend', onTouchEnd);
                ref.removeEventListener('touchcancel', onTouchCancel);
              };
            }}
            overscan={{ main: 2, reverse: 0 }}
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
              Header: () => (
                <div className="vlist-header h-0 overflow-hidden pointer-events-none" />
              ),
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
                    variant="flat"
                    isDisabled={$filter === "starred"}
                    fullWidth
                    startContent={
                      $isSyncing || $loadingMore ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCheck className="size-4" />
                      )
                    }
                    onPress={() => {
                      if (feedId) {
                        handleMarkAllRead("feed", feedId);
                      } else if (categoryId) {
                        handleMarkAllRead("category", categoryId);
                      } else {
                        handleMarkAllRead();
                      }
                    }}
                  >
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

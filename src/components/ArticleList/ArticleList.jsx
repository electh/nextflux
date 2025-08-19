import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  filter,
  filteredArticles,
  loadArticles,
  hasMore,
  currentPage,
  loading,
  visibleRange,
} from "@/stores/articlesStore.js";
import { lastSync } from "@/stores/syncStore.js";
import { useParams } from "react-router-dom";
import ArticleListHeader from "./components/ArticleListHeader";
import ArticleListContent from "./components/ArticleListContent";
import ArticleListFooter from "./components/ArticleListFooter";
import { settingsState } from "@/stores/settingsStore.js";
import ArticleView from "@/components/ArticleView/ArticleView.jsx";
import Indicator from "@/components/ArticleList/components/Indicator.jsx";

const ArticleList = () => {
  const { feedId, categoryId } = useParams();
  const $filteredArticles = useStore(filteredArticles);
  const $filter = useStore(filter);
  const $lastSync = useStore(lastSync);
  const { showUnreadByDefault, sortDirection, sortField, showHiddenFeeds, showIndicator } =
    useStore(settingsState);
  const virtuosoRef = useRef(null);

  const lastSyncTime = useRef(null);

  useEffect(() => {
    // 如果为同步触发刷新且当前文章列表不在顶部，则暂时不刷新列表，防止位置发生位移
    if (
      $lastSync !== lastSyncTime.current &&
      visibleRange.get().startIndex !== 0
    ) {
      // 记录上一次同步时间
      lastSyncTime.current = $lastSync;
      return;
    }
    // 记录上一次同步时间
    lastSyncTime.current = $lastSync;
    let ignore = false;
    const handleFetchArticles = async () => {
      filteredArticles.set([]);
      loading.set(true);
      try {
        const res = await loadArticles(
          feedId || categoryId,
          feedId ? "feed" : categoryId ? "category" : null,
        );

        if (ignore) {
          return;
        }

        filteredArticles.set(res.articles);
        hasMore.set(res.isMore);
        currentPage.set(1);
        loading.set(false);
      } catch {
        console.error("加载文章失败");
        loading.set(false);
      }
    };
    handleFetchArticles(ignore);

    return () => {
      ignore = true;
    };
  }, [feedId, categoryId, $filter, sortDirection, sortField, showHiddenFeeds, $lastSync]);

  // 组件挂载时设置默认过滤器
  useEffect(() => {
    if (!feedId && !categoryId && showUnreadByDefault) {
      filter.set("unread");
    }
  }, []);

  // resizable list width (stored in localStorage)
  const getInitialListWidth = () => {
    try {
        const stored = localStorage.getItem("listWidth");
        if (stored) return stored;
      } catch {
        // ignore
      }
    // default values align with existing CSS (18rem - 30%)
    return "30%";
  };

  const [listWidth, setListWidth] = useState(getInitialListWidth);
  const resizerRef = useRef(null);
  const isDragging = useRef(false);
  const pointerIdRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("listWidth", listWidth);
    } catch {
      // ignore
    }
  }, [listWidth]);

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      // compute new width in px then convert to percentage of container
      const container = resizerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newWidthPx = e.clientX - rect.left;
      // clamp
      const min = 200; // px
      const max = rect.width - 320; // leave space for article view
      const clamped = Math.max(min, Math.min(max, newWidthPx));
      const percent = (clamped / rect.width) * 100;
      setListWidth(`${percent}%`);
    };

    const onPointerUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = "auto";
      try {
        const id = pointerIdRef.current;
        if (id != null && resizerRef.current?.releasePointerCapture) {
          resizerRef.current.releasePointerCapture(id);
        }
      } catch {
        // ignore
      }
      pointerIdRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div className="main-content flex group" style={{ columnGap: 0 }}>
      <div
        className="w-full relative h-dvh flex flex-col"
        style={{ width: listWidth, minWidth: 200, maxWidth: "60%" }}
      >
        <ArticleListHeader />
        {showIndicator && <Indicator virtuosoRef={virtuosoRef} />}
        <ArticleListContent
          articles={$filteredArticles}
          virtuosoRef={virtuosoRef}
          setVisibleRange={(range) => {
            visibleRange.set(range);
          }}
        />
        <ArticleListFooter />
      </div>

      {/* resizer (overlaps the list; only visible on hover) */}
      <div
        ref={resizerRef}
        role="separator"
        aria-orientation="vertical"
        className="h-dvh cursor-col-resize bg-transparent hover:bg-overlay/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
        style={{ width: 16, touchAction: "none", marginLeft: -16, zIndex: 20 }}
        onPointerDown={(e) => {
          isDragging.current = true;
          // avoid selecting text while dragging
          document.body.style.userSelect = "none";
          try {
            pointerIdRef.current = e.pointerId;
            if (resizerRef.current?.setPointerCapture) {
              resizerRef.current.setPointerCapture(e.pointerId);
            }
          } catch {
            // ignore
          }
        }}
      >
        {/* visual handle: three vertical dots */}
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            <span className="block w-1 h-1 rounded-full bg-default-400" />
            <span className="block w-1 h-1 rounded-full bg-default-400" />
            <span className="block w-1 h-1 rounded-full bg-default-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 h-dvh">
        <ArticleView />
      </div>
    </div>
  );
};

export default ArticleList;

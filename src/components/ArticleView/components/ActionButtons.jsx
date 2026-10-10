import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { handleMarkStatus } from "@/handlers/articleHandlers.js";
import { activeArticle, filteredArticles } from "@/stores/articlesStore.js";
import {
  getAdjacentArticle,
  getArticleBasePath,
} from "@/domain/articles/articleNavigation.js";
import ArticleNavigationControls from "./ArticleNavigationControls.jsx";
import ArticleStateActions from "./ArticleStateActions.jsx";
import { useAutoHideToolbar } from "@/hooks/useAutoHideToolbar.js";
import { settingsState } from "@/stores/settingsStore.js";
export default function ActionButtons({
  scrollAreaRef,
  isExpanded,
  canExpand,
  onToggleExpanded,
}) {
  const { articleId } = useParams();
  const { autoHideToolbar } = useStore(settingsState);
  const { toolbarRef, hidden, ...toolbarEvents } = useAutoHideToolbar(
    scrollAreaRef,
    autoHideToolbar,
    articleId,
  );
  const navigate = useNavigate();
  const articles = useStore(filteredArticles);
  const active = useStore(activeArticle);
  // Route identity remains available while the detail query is loading.
  const targetId = Number(articleId);
  const article =
    active?.id === targetId
      ? active
      : articles.find(({ id }) => id === targetId);
  const basePath = getArticleBasePath(window.location.pathname);
  const previous = getAdjacentArticle(articles, targetId, "previous");
  const next = getAdjacentArticle(articles, targetId, "next");
  const openArticle = async (target) => {
    if (!target) return;
    navigate(`${basePath === "/" ? "" : basePath}/article/${target.id}`);
    if (target.status !== "read") await handleMarkStatus(target);
  };
  return (
    <div
      ref={toolbarRef}
      data-hidden={hidden}
      {...toolbarEvents}
      className="action-buttons py-2 standalone:pt-safe-or-2.5 px-2 sticky top-0 z-50"
    >
      <div className="flex items-center">
        <ArticleNavigationControls
          canGoNext={Boolean(next)}
          canGoPrevious={Boolean(previous)}
          onClose={() => navigate(basePath)}
          onNext={() => openArticle(next)}
          onPrevious={() => openArticle(previous)}
        />
        <ArticleStateActions
          article={article}
          canExpand={canExpand}
          isExpanded={isExpanded}
          onToggleExpanded={onToggleExpanded}
        />
      </div>
    </div>
  );
}

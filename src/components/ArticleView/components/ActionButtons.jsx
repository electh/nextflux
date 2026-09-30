import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { handleMarkStatus } from "@/handlers/articleHandlers.js";
import { activeArticle, filteredArticles } from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import {
  getAdjacentArticle,
  getArticleBasePath,
} from "@/domain/articles/articleNavigation.js";
import ArticleNavigationControls from "./ArticleNavigationControls.jsx";
import ArticleStateActions from "./ArticleStateActions.jsx";
export default function ActionButtons() {
  const navigate = useNavigate();
  const articles = useStore(filteredArticles);
  const article = useStore(activeArticle);
  const { floatingSidebar } = useStore(settingsState);
  const basePath = getArticleBasePath(window.location.pathname);
  const previous = getAdjacentArticle(articles, article?.id, "previous");
  const next = getAdjacentArticle(articles, article?.id, "next");
  const openArticle = async (target) => {
    if (!target) return;
    navigate(`${basePath === "/" ? "" : basePath}/article/${target.id}`);
    if (target.status !== "read") await handleMarkStatus(target);
  };
  return (
    <div
      className={cn(
        "action-buttons py-2 standalone:pt-safe-or-2.5 backdrop-blur-sm border-b border-foreground/10 px-2 sticky top-0 z-50",
        floatingSidebar
          ? "bg-background/70"
          : "bg-background/70 md:bg-overlay/70",
      )}
    >
      <div className="flex items-center">
        <ArticleNavigationControls
          canGoNext={Boolean(next)}
          canGoPrevious={Boolean(previous)}
          onClose={() => navigate(basePath)}
          onNext={() => openArticle(next)}
          onPrevious={() => openArticle(previous)}
        />
        <ArticleStateActions article={article} />
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useStore } from "@nanostores/react";
import { Circle, CircleDot, FileText, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import Confetti from "@/components/ui/Confetti";
import {
  handleMarkStatus,
  handleToggleContent,
  handleToggleStar,
} from "@/handlers/articleHandlers.js";
import {
  loadingOriginContent,
  pendingArticleMutations,
} from "@/stores/articlesStore.js";
import ArticleAiAction from "./ArticleAiAction.jsx";
import ArticleExternalActions from "./ArticleExternalActions.jsx";
export default function ArticleStateActions({ article }) {
  const { t } = useTranslation();
  const starButtonRef = useRef(null);
  const fetchLoading = useStore(loadingOriginContent);
  const pending = useStore(pendingArticleMutations);
  const statusPending = article ? `${article.id}:status` in pending : false;
  const starPending = article ? `${article.id}:starred` in pending : false;
  return (
    <div className="flex gap-1 ml-auto">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              aria-label={
                article?.status === "read"
                  ? t("common.unread")
                  : t("common.read")
              }
              onClick={() => handleMarkStatus(article)}
              disabled={!article || statusPending}
              aria-busy={statusPending}
              size="icon-sm"
            >
              {article?.status === "unread" ? (
                <CircleDot className="size-4 text-muted-foreground p-0.5 fill-current" />
              ) : (
                <Circle className="size-4 text-muted-foreground p-0.5" />
              )}
            </Button>
          }
          delay={0}
        />
        <TooltipContent>
          {article?.status === "read" ? t("common.unread") : t("common.read")}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              ref={starButtonRef}
              disabled={!article || starPending}
              aria-busy={starPending}
              variant="ghost"
              aria-label={
                article?.starred === 1 ? t("common.unstar") : t("common.star")
              }
              onClick={() => {
                if (starPending) return;
                if (article?.starred === 0) Confetti(starButtonRef);
                handleToggleStar(article);
              }}
              size="icon-sm"
            >
              <Star
                className={`size-4 text-muted-foreground ${article?.starred === 1 ? "fill-current" : ""}`}
              />
            </Button>
          }
          delay={0}
        />
        <TooltipContent>
          {article?.starred === 1 ? t("common.unstar") : t("common.star")}
        </TooltipContent>
      </Tooltip>
      <ArticleExternalActions article={article} />
      <ArticleAiAction article={article} />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              aria-label={
                article?.shownOriginal
                  ? t("articleView.showSummary")
                  : t("articleView.getFullText")
              }
              onClick={() => handleToggleContent(article)}
              disabled={!article || fetchLoading}
              aria-busy={fetchLoading}
              size="icon-sm"
            >
              {fetchLoading ? (
                <Spinner />
              ) : (
                <FileText
                  className={cn(
                    "size-4",
                    article?.shownOriginal
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              )}
            </Button>
          }
          delay={0}
        />
        <TooltipContent>
          {article?.shownOriginal
            ? t("articleView.showSummary")
            : t("articleView.getFullText")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

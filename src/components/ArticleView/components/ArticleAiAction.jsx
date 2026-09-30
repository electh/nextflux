import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { summarizeArticleStream } from "@/api/openai.js";
import {
  aiSummaries,
  appendSummaryChunk,
  setSummaryDone,
  setSummaryError,
  setSummaryLoading,
} from "@/stores/aiStore.js";
import { settingsState } from "@/stores/settingsStore.js";
export default function ArticleAiAction({ article }) {
  const { t } = useTranslation();
  const { aiApiKey } = useStore(settingsState);
  const summaries = useStore(aiSummaries);
  const state = summaries[article?.id];
  if (!aiApiKey) return null;
  const summarize = () => {
    if (!article || state?.loading) return;
    setSummaryLoading(article.id);
    let frame = null;
    let pendingText = "";
    const flush = () => {
      if (pendingText) appendSummaryChunk(article.id, pendingText);
      pendingText = "";
      frame = null;
    };
    summarizeArticleStream(article, {
      onChunk: (chunk) => {
        pendingText += chunk;
        if (!frame) frame = requestAnimationFrame(flush);
      },
      onDone: () => {
        if (frame) cancelAnimationFrame(frame);
        flush();
        setSummaryDone(article.id);
      },
      onError: (error) => {
        if (frame) cancelAnimationFrame(frame);
        setSummaryError(article.id, error.message);
        toast.error(error.message);
      },
    });
  };
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            aria-label={t("articleView.aiSummarize")}
            onClick={summarize}
            disabled={state?.loading}
            aria-busy={state?.loading}
            size="icon-sm"
          >
            {state?.loading ? (
              <Spinner />
            ) : (
              <Sparkles
                className={`size-4 ${state?.summary ? "text-accent" : "text-muted-foreground"}`}
              />
            )}
          </Button>
        }
        delay={0}
      />
      <TooltipContent>{t("articleView.aiSummarize")}</TooltipContent>
    </Tooltip>
  );
}

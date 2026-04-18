import {
  ArrowLeft,
  Circle,
  CircleDot,
  FileText,
  Share,
  Star,
  CloudUpload,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  handleMarkStatus,
  handleToggleStar,
  handleToggleContent,
} from "@/handlers/articleHandlers.js";
import { Button, CloseButton, cn, Spinner, Tooltip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import {
  activeArticle,
  filteredArticles,
  loadingOriginContent,
} from "@/stores/articlesStore";
import Confetti from "@/components/ui/Confetti";
import { useRef, useState } from "react";
import minifluxAPI from "@/api/miniflux";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { hasIntegrations } from "@/stores/basicInfoStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import {
  aiSummaries,
  setSummaryLoading,
  appendSummaryChunk,
  setSummaryDone,
  setSummaryError,
} from "@/stores/aiStore.js";
import { summarizeArticleStream } from "@/api/openai.js";

export default function ActionButtons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const $articles = useStore(filteredArticles);
  const $activeArticle = useStore(activeArticle);
  const buttonRef = useRef(null);
  const fetchLoading = useStore(loadingOriginContent);
  const [saveLoading, setSaveLoading] = useState(false);
  const $hasIntegrations = useStore(hasIntegrations);
  const { aiApiKey } = useStore(settingsState);
  const $aiSummaries = useStore(aiSummaries);
  const currentSummaryState = $aiSummaries[$activeArticle?.id];

  // 获取当前文章在列表中的索引
  const currentIndex = $articles.findIndex((a) => a.id === $activeArticle?.id);

  // 获取当前路径并去掉 article 部分
  const basePath = window.location.pathname.split("/article/")[0];

  // 处理关闭按钮点击
  const handleClose = () => {
    navigate(basePath || "/");
  };

  // 处理上一篇按钮点击
  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevArticle = $articles[currentIndex - 1];
      navigate(`${basePath}/article/${prevArticle.id}`);
      if (prevArticle.status !== "read") {
        await handleMarkStatus(prevArticle);
      }
    }
  };

  // 处理下一篇按钮点击
  const handleNext = async () => {
    if (currentIndex < $articles.length - 1) {
      const nextArticle = $articles[currentIndex + 1];
      navigate(`${basePath}/article/${nextArticle.id}`);
      if (nextArticle.status !== "read") {
        await handleMarkStatus(nextArticle);
      }
    }
  };

  // 处理分享按钮点击
  const handleShare = async () => {
    if (!$activeArticle) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: $activeArticle.title,
          url: $activeArticle.url,
        });
      } else {
        // 如果不支持原生分享,则复制链接到剪贴板
        await navigator.clipboard.writeText($activeArticle.url);
      }
    } catch (error) {
      console.error("分享失败:", error);
    }
  };

  // 处理AI总结
  const handleAISummarize = () => {
    if (!$activeArticle) return;
    const articleId = $activeArticle.id;
    if (currentSummaryState?.loading) return;
    setSummaryLoading(articleId);

    let rafId = null;
    let pendingText = "";

    const flush = () => {
      if (pendingText) {
        appendSummaryChunk(articleId, pendingText);
        pendingText = "";
      }
      rafId = null;
    };

    summarizeArticleStream($activeArticle, {
      onChunk: (chunk) => {
        pendingText += chunk;
        if (!rafId) rafId = requestAnimationFrame(flush);
      },
      onDone: () => {
        if (rafId) cancelAnimationFrame(rafId);
        flush();
        setSummaryDone(articleId);
      },
      onError: (error) => {
        if (rafId) cancelAnimationFrame(rafId);
        setSummaryError(articleId, error.message);
        toast.error(error.message);
      },
    });
  };

  // 处理保存到第三方服务
  const handleSaveToThirdParty = async () => {
    if (!$activeArticle) return;
    setSaveLoading(true);
    try {
      await minifluxAPI.saveToThirdParty($activeArticle.id);
      toast.success(t("common.success"));
    } catch (error) {
      console.error("保存到第三方服务失败:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="action-buttons py-2 standalone:pt-safe-or-2.5 bg-background/70 md:bg-overlay/70 backdrop-blur-lg border-b border-foreground/10 px-2 sticky top-0 z-50">
      <div className="flex items-center">
        <Tooltip
          content={t("common.close")}
          classNames={{ content: "shadow-custom!" }}
        >
          <CloseButton onPress={handleClose} className="mx-2" />
          <Tooltip.Content>{t("common.close")}</Tooltip.Content>
        </Tooltip>
        <div className="mr-auto flex gap-1">
          <Tooltip delay={0}>
            <Button
              onPress={handlePrevious}
              isDisabled={currentIndex <= 0}
              isIconOnly
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4 text-muted" />
            </Button>
            <Tooltip.Content>{t("common.previous")}</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              onPress={handleNext}
              isDisabled={currentIndex >= $articles.length - 1}
              isIconOnly
              variant="ghost"
            >
              <ArrowRight className="h-4 w-4 text-muted" />
            </Button>
            <Tooltip.Content>{t("common.next")}</Tooltip.Content>
          </Tooltip>
        </div>
        <div className="flex gap-1">
          <Tooltip delay={0}>
            <Button
              onPress={() => handleMarkStatus($activeArticle)}
              variant="ghost"
              isIconOnly
            >
              {$activeArticle?.status === "read" ? (
                <Circle className="size-4 text-muted p-0.5" />
              ) : (
                <CircleDot className="size-4 text-muted p-0.5 fill-current" />
              )}
            </Button>
            <Tooltip.Content>
              {$activeArticle?.status === "read"
                ? t("common.unread")
                : t("common.read")}
            </Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button
              ref={buttonRef}
              variant="ghost"
              isIconOnly
              onPress={() => {
                $activeArticle?.starred === 0 && Confetti(buttonRef);
                handleToggleStar($activeArticle);
              }}
            >
              <Star
                className={`size-4 text-muted ${$activeArticle?.starred === 1 ? "fill-current" : ""}`}
              />
            </Button>
            <Tooltip.Content>
              {$activeArticle?.starred === 1
                ? t("common.unstar")
                : t("common.star")}
            </Tooltip.Content>
          </Tooltip>
          {$hasIntegrations && (
            <Tooltip delay={0}>
              <Button
                variant="ghost"
                isIconOnly
                onPress={handleSaveToThirdParty}
                isPending={saveLoading}
              >
                {saveLoading ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <CloudUpload className="size-4 text-muted" />
                )}
              </Button>
              <Tooltip.Content>
                {t("articleView.saveToThirdParty")}
              </Tooltip.Content>
            </Tooltip>
          )}
          {aiApiKey && (
            <Tooltip delay={0}>
              <Button
                onPress={handleAISummarize}
                variant="ghost"
                isIconOnly
                isPending={currentSummaryState?.loading}
              >
                {currentSummaryState?.loading ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <Sparkles
                    className={`size-4 ${currentSummaryState?.summary ? "text-accent" : "text-muted"}`}
                  />
                )}
              </Button>
              <Tooltip.Content>{t("articleView.aiSummarize")}</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip delay={0}>
            <Button
              onPress={() => handleToggleContent($activeArticle)}
              variant="ghost"
              isIconOnly
              isPending={fetchLoading}
            >
              {fetchLoading ? (
                <Spinner color="current" size="sm" />
              ) : (
                <FileText
                  className={cn(
                    "size-4",
                    $activeArticle?.shownOriginal
                      ? "text-accent"
                      : "text-muted",
                  )}
                />
              )}
            </Button>
            <Tooltip.Content>
              {$activeArticle?.shownOriginal
                ? t("articleView.showSummary")
                : t("articleView.getFullText")}
            </Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button variant="ghost" isIconOnly onPress={handleShare}>
              <Share className="size-4 text-muted" />
            </Button>
            <Tooltip.Content>{t("common.share")}</Tooltip.Content>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

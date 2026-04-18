import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { aiSummaries, clearSummary } from "@/stores/aiStore.js";
import { CloseButton, Spinner } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import BorderBeam from "border-beam";
import { currentThemeMode } from "@/stores/themeStore.js";

const TICK_MS = 16; // ~60fps
const CHARS_STREAMING = 5; // 流式输出中每帧显示字符数
const CHARS_CATCHUP = 24; // 输出结束后快速追赶

export default function AISummary({ articleId }) {
  const { t } = useTranslation();
  const $aiSummaries = useStore(aiSummaries);
  const $currentThemeMode = useStore(currentThemeMode);
  const state = $aiSummaries[articleId];

  const [displayedText, setDisplayedText] = useState("");
  const stateRef = useRef(state);

  // 始终保持 ref 最新
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 切换文章、或重新触发总结时重置显示
  useEffect(() => {
    setDisplayedText("");
  }, [articleId]);

  useEffect(() => {
    if (state?.loading && state?.summary === "") {
      setDisplayedText("");
    }
  }, [state?.loading]);

  // 逐字追赶定时器，只随 articleId 重建
  useEffect(() => {
    const timer = setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const full = s.summary || "";
      setDisplayedText((prev) => {
        if (prev.length >= full.length) return prev;
        const step = s.loading ? CHARS_STREAMING : CHARS_CATCHUP;
        return full.slice(0, prev.length + step);
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [articleId]);

  if (!state) return null;

  const isTyping =
    state.loading || displayedText.length < (state.summary?.length ?? 0);
  const isWaiting = state.loading && !state.summary;

  return (
    <BorderBeam
      active={isWaiting || isTyping}
      size="line"
      theme={$currentThemeMode}
    >
      <div className="ai-summary p-4 bg-background rounded-2xl">
        <div className="flex gap-2 h-10">
          <div className="flex items-center gap-1 h-auto">
            <Sparkles className="size-4 text-accent shrink-0" />
            <span className="text-sm font-medium text-accent">
              {t("articleView.aiSummary")}
            </span>
          </div>
          {!isTyping && (
            <CloseButton
              onPress={() => clearSummary(articleId)}
              className="ml-auto"
            />
          )}
        </div>

        {isWaiting && (
          <div className="flex items-center gap-2 text-sm text-muted py-2">
            <Spinner size="sm" color="current" />
            <span>{t("articleView.aiSummaryGenerating")}</span>
          </div>
        )}

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        {displayedText && (
          <div className="text-sm text-muted leading-relaxed">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </BorderBeam>
  );
}

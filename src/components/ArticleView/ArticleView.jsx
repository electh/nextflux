import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import "react-photo-view/dist/react-photo-view.css";
import "./ArticleView.css";
import ActionButtons from "./components/ActionButtons.jsx";
import ArticleContent from "./components/ArticleContent.jsx";
import ArticleHeader from "./components/ArticleHeader.jsx";
import AISummary from "./components/AISummary.jsx";
import EmptyPlaceholder from "@/components/ArticleList/components/EmptyPlaceholder";
import { activeArticle, filteredArticles } from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore";
import { currentThemeMode, themeState } from "@/stores/themeStore.js";
import { getArticleById } from "@/db/storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils.js";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
function useActiveArticle(articleId, articlesVersion) {
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function loadArticle() {
      if (!articleId) {
        activeArticle.set(null);
        return;
      }
      setError(null);
      try {
        const article = await getArticleById(articleId);
        if (cancelled) return;
        if (!article) {
          setError("请选择要阅读的文章");
          return;
        }
        activeArticle.set({
          ...article,
          originalContent: article.content,
        });
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }
    loadArticle();
    return () => {
      cancelled = true;
    };
  }, [articleId, articlesVersion]);
  return error;
}
export default function ArticleView() {
  const { articleId } = useParams();
  const article = useStore(activeArticle);
  const articles = useStore(filteredArticles);
  const {
    lineHeight,
    fontSize,
    maxWidth,
    alignJustify,
    fontFamily,
    titleFontSize,
    titleAlignType,
    floatingSidebar,
  } = useStore(settingsState);
  const reduceMotion = useReducedMotion();
  const { lightTheme } = useStore(themeState);
  const themeMode = useStore(currentThemeMode);
  const scrollAreaRef = useRef(null);
  const { isMedium } = useIsMobile();
  const error = useActiveArticle(articleId, articles);
  const isStoneTheme = lightTheme === "stone" && themeMode === "light";
  useEffect(() => {
    const viewport = scrollAreaRef.current;
    if (!viewport) return undefined;
    const timer = setTimeout(
      () =>
        viewport.scrollTo({
          top: 0,
          behavior: "instant",
        }),
      reduceMotion ? 1 : 300,
    );
    return () => clearTimeout(timer);
  }, [articleId, reduceMotion]);
  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <AnimatePresence mode={isMedium ? "wait" : "popLayout"} initial={false}>
        <motion.div
          key={articleId ? "content" : "empty"}
          className={cn(
            "motion-sensitive flex-1 p-0 h-screen fixed md:static inset-0 z-20",
            !articleId && "hidden md:flex md:flex-1",
            !floatingSidebar && "md:pr-2 md:py-2",
          )}
          initial={
            articleId
              ? {
                  opacity: 1,
                  x: "100vw",
                }
              : {
                  opacity: 0,
                  x: 0,
                  scale: 0.8,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={
            !articleId && isMedium
              ? false
              : articleId
                ? {
                    opacity: 1,
                    x: "100vw",
                    scale: 1,
                  }
                : {
                    opacity: 0,
                    x: 0,
                    scale: 0.8,
                  }
          }
          transition={{
            duration: 0.5,
            type: "spring",
            bounce: 0,
            ease: "easeInOut",
          }}
        >
          {!article || error ? (
            <EmptyPlaceholder />
          ) : (
            <div
              ref={scrollAreaRef}
              className={cn(
                "overflow-y-auto",
                cn(
                  "article-scroll-area h-full bg-background md:bg-transparent relative",
                  !floatingSidebar &&
                    "md:bg-overlay md:shadow-custom md:rounded-2xl",
                ),
              )}
            >
              <ActionButtons />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={articleId}
                  initial={
                    reduceMotion
                      ? {}
                      : {
                          y: 12,
                          opacity: 0,
                        }
                  }
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={
                    reduceMotion
                      ? {}
                      : {
                          y: -12,
                          opacity: 0,
                        }
                  }
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className="article-view-content px-5 pt-5 pb-20 w-full mx-auto"
                  style={{
                    maxWidth: `${maxWidth}ch`,
                    fontFamily,
                  }}
                >
                  <ArticleHeader
                    article={article}
                    fontSize={fontSize}
                    titleAlignType={titleAlignType}
                    titleFontSize={titleFontSize}
                  />
                  <AISummary articleId={article.id} />
                  <ArticleContent
                    article={article}
                    alignJustify={alignJustify}
                    fontSize={fontSize}
                    isStoneTheme={isStoneTheme}
                    lineHeight={lineHeight}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

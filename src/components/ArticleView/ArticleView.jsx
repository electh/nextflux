import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import "react-photo-view/dist/react-photo-view.css";
import "./ArticleView.css";
import ActionButtons from "./components/ActionButtons.jsx";
import ArticleBody from "./components/ArticleBody.jsx";
import ArticleHeader from "./components/ArticleHeader.jsx";
import ArticleTransition from "./components/ArticleTransition.jsx";
import EmptyPlaceholder from "@/components/ArticleList/components/EmptyPlaceholder";
import {
  activeArticle,
  filteredArticles,
  pendingArticleMutations,
} from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore";
import { getArticleById } from "@/db/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { sameRecord } from "@/domain/sync/reconcileRecords.js";
import { getArticleQueryState } from "@/domain/articles/articleQueryState.js";
import {
  getArticleBasePath,
  getArticleTransitionDirection,
} from "@/domain/articles/articleNavigation.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils.js";
import ArticleLoading from "./components/ArticleLoading.jsx";
import ArticleReadingRail from "./components/ArticleReadingRail.jsx";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
function useActiveArticle(articleId) {
  const result = useLiveQuery(async () => {
    if (!articleId) return { articleId, article: null };
    try {
      return { articleId, article: await getArticleById(articleId) };
    } catch (error) {
      return { articleId, error: error.message, article: null };
    }
  }, [articleId]);
  useEffect(() => {
    const current = activeArticle.get();
    if (current && current.id !== Number(articleId)) activeArticle.set(null);
    if (!result || result.articleId !== articleId) return;
    const article = result.article;
    if (!article) {
      activeArticle.set(null);
      return;
    }
    // Preserve fetched original content and AI state when only status changes.
    const next =
      current?.id === article.id
        ? {
            ...current,
            ...article,
            content: current.shownOriginal ? current.content : article.content,
            originalContent: article.content,
          }
        : { ...article, originalContent: article.content };
    // A database notification for one field must not erase another pending edit.
    const pending = pendingArticleMutations.get();
    for (const field of ["status", "starred"]) {
      const key = `${article.id}:${field}`;
      if (key in pending) next[field] = pending[key];
    }
    if (!sameRecord(current, next)) activeArticle.set(next);
  }, [articleId, result]);
  return getArticleQueryState(articleId, result);
}
export default function ArticleView() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const isExpanded = Boolean(articleId && expandedArticleId === articleId);
  useEffect(() => {
    setExpandedArticleId(null);
  }, [articleId]);
  const { t } = useTranslation();
  const storedArticle = useStore(activeArticle);
  const cachedArticles = useStore(filteredArticles);
  const previousNavigation = useRef({
    articleId,
    articles: cachedArticles,
    direction: 1,
  });
  const previous = previousNavigation.current;
  const direction =
    previous.articleId === articleId
      ? previous.direction
      : (getArticleTransitionDirection(
          cachedArticles,
          previous.articleId,
          articleId,
        ) ??
        getArticleTransitionDirection(
          previous.articles,
          previous.articleId,
          articleId,
        ) ??
        1);
  useLayoutEffect(() => {
    previousNavigation.current = {
      articleId,
      articles: cachedArticles,
      direction,
    };
  }, [articleId, cachedArticles, direction]);
  const article =
    storedArticle?.id === Number(articleId)
      ? storedArticle
      : cachedArticles.find(({ id }) => id === Number(articleId));
  const {
    lineHeight,
    fontSize,
    maxWidth,
    alignJustify,
    fontFamily,
    titleFontSize,
    titleAlignType,
    showReadingRail,
  } = useStore(settingsState);
  const reduceMotion = useReducedMotion();
  const scrollAreaRef = useRef(null);
  const previousExpansion = useRef(isExpanded);
  useLayoutEffect(() => {
    const changed = previousExpansion.current !== isExpanded;
    previousExpansion.current = isExpanded;
    if (!changed || reduceMotion || !articleId) return;

    // Animate the surface after reflow; scaling the layout stretches text,
    // media and toolbar icons as the panel changes width.
    const animation = scrollAreaRef.current?.animate(
      [
        { opacity: 0.65, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => animation?.cancel();
  }, [isExpanded, reduceMotion, articleId]);
  const { isMedium } = useIsMobile();
  const { error, loading } = useActiveArticle(articleId);
  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <div
        className={cn(
          "motion-sensitive flex-1 min-w-0 w-full p-0 inset-0",
          isExpanded
            ? "fixed h-dvh z-30"
            : "h-screen fixed md:static z-20 md:pr-2 md:py-2",
          !articleId && "pointer-events-none md:pointer-events-auto",
        )}
      >
        <div className="relative h-full w-full min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {(articleId || !isMedium) && (
              <motion.div
                key={articleId ? "reader" : "empty"}
                className={cn(
                  "article-reader-panel relative h-full w-full min-w-0",
                  showReadingRail && "has-reading-rail",
                )}
                initial={
                  reduceMotion
                    ? false
                    : articleId
                      ? { x: "100vw", opacity: 1, scale: 1 }
                      : { x: 0, opacity: 0, scale: 0.8 }
                }
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : articleId
                      ? { x: "100vw", opacity: 1, scale: 1 }
                      : { x: 0, opacity: 0, scale: 0.8 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  type: "spring",
                  bounce: 0,
                }}
              >
                {!articleId ? (
                  <EmptyPlaceholder />
                ) : (
                  <>
                    <div
                      ref={scrollAreaRef}
                      className={cn(
                        "article-scroll-area overflow-y-auto w-full min-w-0 h-full bg-popover relative",
                        !isExpanded && "md:shadow-custom md:rounded-2xl",
                      )}
                    >
                      <ActionButtons
                        scrollAreaRef={scrollAreaRef}
                        isExpanded={isExpanded}
                        canExpand={!isMedium}
                        onToggleExpanded={() =>
                          setExpandedArticleId(isExpanded ? null : articleId)
                        }
                      />
                      <AnimatePresence
                        mode="wait"
                        custom={direction}
                        initial={false}
                      >
                        <ArticleTransition
                          key={articleId}
                          direction={direction}
                          reduceMotion={reduceMotion}
                          scrollAreaRef={scrollAreaRef}
                        >
                          {error ? (
                            <div
                              role="alert"
                              className="p-5 text-muted-foreground"
                            >
                              {error}
                            </div>
                          ) : article ? (
                            <div
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
                              <ArticleBody
                                article={article}
                                alignJustify={alignJustify}
                                fontSize={fontSize}
                                lineHeight={lineHeight}
                              />
                            </div>
                          ) : loading ? (
                            <ArticleLoading />
                          ) : (
                            <EmptyPlaceholder
                              title={t("articleView.notFoundTitle")}
                              description={t("articleView.notFoundDescription")}
                              className="h-[calc(100dvh-8rem)] min-h-64 bg-transparent shadow-none rounded-none px-6"
                            >
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  navigate(
                                    getArticleBasePath(
                                      window.location.pathname,
                                    ),
                                  )
                                }
                              >
                                {t("articleView.backToList")}
                              </Button>
                            </EmptyPlaceholder>
                          )}
                        </ArticleTransition>
                      </AnimatePresence>
                    </div>
                    {showReadingRail && article && !error && (
                      <ArticleReadingRail
                        key={articleId}
                        article={article}
                        scrollAreaRef={scrollAreaRef}
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

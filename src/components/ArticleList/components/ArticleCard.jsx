import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuTrigger,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useNavigate, useParams } from "react-router-dom";
import { Ripple } from "m3-ripple";
import { Clock, ArrowUpFromLine, Star, Circle, CircleDot } from "lucide-react";
import {
  cleanTitle,
  cn,
  extractFirstImage,
  extractTextFromHtml,
} from "@/lib/utils";
import { formatPublishDate } from "@/lib/format";
import ArticleCardCover from "./ArticleCardCover.jsx";
import {
  handleMarkStatus,
  handleMarkAboveAsRead,
} from "@/handlers/articleHandlers.js";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@nanostores/react";
import { settingsState } from "@/stores/settingsStore";
import { feeds } from "@/stores/feedsStore";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { useTranslation } from "react-i18next";
export default function ArticleCard({ article }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const cardRef = useRef(null);
  const $feeds = useStore(feeds);
  const {
    markAsReadOnScroll,
    cardImageSize,
    showFavicon,
    showReadingTime,
    textPreviewLines,
    titleLines,
  } = useStore(settingsState);
  const hasBeenVisible = useRef(false);
  const imageUrl = useMemo(() => extractFirstImage(article), [article]);
  const feedTitle = useMemo(() => {
    const feed = $feeds.find((f) => f.id === article.feedId);
    return feed?.title || article.feedId;
  }, [article.feedId, $feeds]);
  const previewContent = useMemo(
    () => extractTextFromHtml(article.content).slice(0, 300),
    [article.content],
  );
  useEffect(() => {
    // 如果文章已读或未启用滚动标记已读,则不需要观察
    if (article.status === "read" || !markAsReadOnScroll) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardRect = entry.boundingClientRect;
          const rootRect = entry.rootBounds;

          // 当文章进入视口时记录状态
          if (entry.isIntersecting) {
            hasBeenVisible.current = true;
          }
          // 只有当卡片完全在视口顶部以上,且之前显示过时才标记已读
          else if (hasBeenVisible.current && cardRect.top < rootRect.top) {
            // console.log(cardRect.bottom, rootRect.top, '标记已读');
            handleMarkStatus(article);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // 设置根元素为滚动容器
        root: document.querySelector(".v-list"),
        // 设置阈值为0,表示完全离开视口时触发
        threshold: 0.2,
      },
    );
    const card = cardRef.current;
    if (card) {
      observer.observe(card);
    }
    return () => {
      if (card) {
        observer.unobserve(card);
      }
    };
  }, [article, markAsReadOnScroll]);
  const handleArticleClick = async (article) => {
    const basePath = window.location.pathname.split("/article/")[0];
    const toUrl =
      basePath === "/"
        ? `/article/${article.id}`
        : `${basePath}/article/${article.id}`;
    navigate(toUrl);
    if (article.status !== "read") {
      await handleMarkStatus(article);
    }
  };
  const handleClick = () => {
    handleArticleClick(article);
  };
  return (
    <ContextMenu>
      <>
        <ContextMenuTrigger
          render={
            <div
              ref={cardRef}
              className={cn(
                "cursor-pointer select-none overflow-hidden p-2 rounded-xl",
                "relative transform-gpu transition-background duration-200",
                "bg-transparent contain-content",
                "hover:bg-overlay/70",
                parseInt(articleId) === article.id &&
                  "bg-overlay/70 shadow-custom",
              )}
              data-article-id={article.id}
              onClick={handleClick}
            >
              <Ripple hoverOpacity={0} pressedOpacity={0.05} duration={100} />
              <div
                className={cn(
                  "card-content flex flex-col gap-1 transition-opacity",
                  article.status === "read" &&
                    article.starred === 0 &&
                    "opacity-50",
                )}
              >
                <div className="card-header flex flex-col gap-1">
                  <div className="card-meta flex items-start justify-between gap-1">
                    <div className="card-source flex items-center flex-1 gap-1 min-w-0">
                      <div className="card-source-content flex gap-1 items-center min-w-0">
                        {showFavicon && <FeedIcon feedId={article.feedId} />}
                        <span className="card-source-title text-muted-foreground font-bold text-xs line-clamp-1">
                          {feedTitle}
                        </span>
                      </div>
                    </div>
                    <div className="card-time-wrapper flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="card-star">
                        <Star
                          className="size-3 fill-current"
                          style={{
                            opacity: article.starred === 1 ? 1 : 0,
                          }}
                        />
                      </span>
                      <span className="card-time whitespace-nowrap">
                        {formatPublishDate(article.published_at)}
                      </span>
                    </div>
                  </div>
                  <div className="card-content-body flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <h3
                        className={cn(
                          "card-title text-base font-semibold text-wrap break-words",
                          article.status === "read"
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                        style={{
                          wordBreak: "break-word",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp:
                            titleLines === 0 ? "none" : titleLines,
                        }}
                      >
                        {cleanTitle(article.title)}
                      </h3>
                      {showReadingTime && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3 shrink-0" />
                          <span className="line-clamp-1">
                            {article.reading_time === 0
                              ? t("common.lessThanAMinute")
                              : `${article.reading_time} ${t("common.minute")}`}
                          </span>
                        </div>
                      )}
                      {textPreviewLines !== 0 && (
                        <span
                          className={cn(
                            "text-sm text-muted-foreground text-wrap break-words w-full max-w-full overflow-hidden",
                          )}
                          style={{
                            wordBreak: "break-word",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: textPreviewLines,
                          }}
                        >
                          {previewContent}
                        </span>
                      )}
                      {cardImageSize === "large" && (
                        <ArticleCardCover imageUrl={imageUrl} />
                      )}
                    </div>
                    {cardImageSize === "small" && (
                      <ArticleCardCover imageUrl={imageUrl} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                handleMarkAboveAsRead(article.id);
              }}
            >
              {<ArrowUpFromLine className="size-4 text-muted-foreground" />}
              {t("common.markAboveAsRead")}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                handleMarkStatus(article);
              }}
            >
              {article.status === "read" ? (
                <CircleDot className="size-4 text-muted-foreground p-0.5 fill-current" />
              ) : (
                <Circle className="size-4 text-muted-foreground p-0.5" />
              )}
              {article.status === "read"
                ? t("common.markAsUnread")
                : t("common.markAsRead")}
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </>
    </ContextMenu>
  );
}

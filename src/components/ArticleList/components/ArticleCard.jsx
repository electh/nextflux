import { useNavigate, useParams } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import { cleanTitle, cn, extractFirstImage } from "@/lib/utils";
import { formatPublishDate } from "@/lib/format";
import ArticleCardCover from "./ArticleCardCover.jsx";
import { handleMarkStatus } from "@/handlers/articleHandlers.js";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@nanostores/react";
import { settingsState } from "@/stores/settingsStore";
import { Ripple, useRipple } from "@heroui/react";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { useTranslation } from "react-i18next";

export default function ArticleCard({ article }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const cardRef = useRef(null);
  const {
    markAsReadOnScroll,
    showTextPreview,
    cardImageSize,
    showFavicon,
    showReadingTime,
    truncateTitles,
  } = useStore(settingsState);
  const hasBeenVisible = useRef(false);
  const { ripples, onClear, onPress } = useRipple();

  const imageUrl = useMemo(() => extractFirstImage(article), [article]);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
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

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 创建一个模拟的 PressEvent 对象
    const pressEvent = {
      type: "press",
      target: e.currentTarget,
      x,
      y,
    };

    onPress(pressEvent);
    handleArticleClick(article);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "cursor-pointer select-none overflow-hidden p-2 rounded-lg",
        "relative transform-gpu transition-background duration-200",
        "bg-transparent contain-content",
        "hover:bg-background/70",
        parseInt(articleId) === article.id && "bg-background/70 shadow-custom",
      )}
      data-article-id={article.id}
      onClick={handleClick}
    >
      <Ripple
        ripples={ripples}
        onClear={onClear}
        color="hsl(var(--heroui-content4))"
      />
      <div
        className={cn(
          "card-content flex flex-col gap-1 transition-opacity",
          article.status === "read" && article.starred === 0 && "opacity-50",
        )}
      >
        <div className="card-header flex flex-col gap-1">
          <div className="card-meta flex items-start justify-between gap-1">
            <div className="card-source flex items-center flex-1 gap-1 min-w-0">
              <div className="card-source-content flex gap-1 items-center min-w-0">
                {showFavicon && <FeedIcon feedId={article.feedId} />}
                <span className="card-source-title text-default-500 font-bold text-xs line-clamp-1">
                  {article.feed?.title}
                </span>
              </div>
            </div>
            <div className="card-time-wrapper flex items-center gap-1 text-xs text-default-400">
              <span className="card-star">
                <Star
                  className="size-3 fill-current"
                  style={{ opacity: article.starred === 1 ? 1 : 0 }}
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
                    ? "text-content2-foreground"
                    : "text-foreground",
                  truncateTitles
                    ? "line-clamp-2"
                    : "",
                )}
              >
                {cleanTitle(article.title)}
              </h3>
              {showReadingTime && (
                <div className="text-xs text-default-500 flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  <span className="line-clamp-1">
                    {article.reading_time === 0
                      ? t("common.lessThanAMinute")
                      : `${article.reading_time} ${t("common.minute")}`}
                  </span>
                </div>
              )}
              {showTextPreview && (
                <span
                  className={cn(
                    "text-sm text-default-500 text-wrap break-words w-full max-w-full overflow-hidden",
                    showReadingTime ? "line-clamp-1" : "line-clamp-2",
                  )}
                  style={{ wordBreak: "break-word" }}
                >
                  {article.plainContent}
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
  );
}

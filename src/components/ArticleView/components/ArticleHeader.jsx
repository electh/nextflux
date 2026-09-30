import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { generateReadableDate } from "@/lib/format.js";
import { cleanTitle, cn } from "@/lib/utils.js";
export default function ArticleHeader({
  article,
  fontSize,
  titleAlignType,
  titleFontSize,
}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  return (
    <>
      <header
        className="article-header"
        style={{
          textAlign: titleAlignType,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/feed/${article.feed?.id}`)}
          className={cn(
            "text-muted-foreground text-sm flex items-center gap-1 hover:cursor-pointer focus:outline-none",
            titleAlignType === "center" && "justify-center",
          )}
        >
          <FeedIcon feedId={article.feed?.id} />
          {article.feed?.title}
        </button>
        <h1
          className="article-title font-semibold my-2 hover:cursor-pointer leading-tight"
          style={{
            fontSize: `${titleFontSize * fontSize}px`,
          }}
        >
          <a href={article.url} rel="noopener noreferrer" target="_blank">
            {cleanTitle(article.title)}
          </a>
        </h1>
        <div className="text-muted-foreground opacity-60 text-sm">
          <time dateTime={article.published_at} key={i18n.language}>
            {generateReadableDate(article.published_at)}
          </time>
        </div>
      </header>
      <Separator className="my-4" />
    </>
  );
}

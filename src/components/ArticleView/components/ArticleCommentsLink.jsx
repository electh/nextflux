import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClient } from "@/api/client.js";
import { db } from "@/db/database.js";
import { reportError } from "@/lib/errors.js";
import { getCommentsUrl } from "@/domain/articles/commentsUrl.js";

export default function ArticleCommentsLink({ article }) {
  const entryId = article?.id;
  const storedUrl = article?.commentsUrl;
  useEffect(() => {
    // Older browser caches predate the comments field; fill it without a resync.
    if (!entryId || storedUrl !== undefined) return;
    const controller = new AbortController();
    apiClient
      .get(`/v1/entries/${entryId}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          return db.articles.update(entryId, {
            commentsUrl: data.comments_url || "",
          });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) reportError(error, "article.comments");
      });
    return () => controller.abort();
  }, [entryId, storedUrl]);
  const url = getCommentsUrl(storedUrl);
  if (!url) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open comments"
            className={buttonVariants({
              variant: "ghost",
              size: "icon-sm",
              className: "rounded-full",
            })}
          >
            <MessageCircle className="size-4 text-muted-foreground" />
          </a>
        }
        delay={0}
      />
      <TooltipContent>Open comments</TooltipContent>
    </Tooltip>
  );
}
